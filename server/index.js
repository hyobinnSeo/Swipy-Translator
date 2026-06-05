require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const textToSpeech = require('@google-cloud/text-to-speech');
const { Firestore } = require('@google-cloud/firestore');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// Configure CORS based on environment
const corsOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://swipy-translator.du.r.appspot.com']
    : ['http://localhost:3000', 'http://localhost:5000'];

const io = new Server(server, {
    cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: corsOrigins,
    credentials: true
}));
app.use(express.json());

// Serve static files in production with cache control
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build'), {
        etag: true,
        lastModified: true,
        setHeaders: (res, path) => {
            if (path.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
            } else {
                res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
            }
        }
    }));
}

// Initialize TTS client
let ttsClient = null;

function initializeClients(credentials) {
    try {
        if (!credentials || !credentials.projectId || !credentials.privateKey || !credentials.clientEmail) {
            throw new Error('Missing required credentials');
        }

        // Create credentials object for Google Cloud
        const googleCredentials = {
            type: "service_account",
            project_id: credentials.projectId,
            private_key: credentials.privateKey,
            client_email: credentials.clientEmail,
            private_key_id: "unused",
            client_id: "unused",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(credentials.clientEmail)}`
        };

        // Initialize TTS client with credentials
        ttsClient = new textToSpeech.TextToSpeechClient({
            credentials: googleCredentials
        });
        
        console.log('Successfully initialized TTS client');
        return { ttsClient };
    } catch (error) {
        console.error('Error initializing TTS client:', error);
        throw error;
    }
}

// Load Google credentials from a local file. Accepts either a full service
// account JSON (service-account.json) or the legacy {projectId, privateKey,
// clientEmail} shape (tts-credentials.json). Returns the normalized shape that
// initializeClients expects, or null when no usable file is found.
function loadCredentialsFromFile() {
    const candidates = ['service-account.json', 'tts-credentials.json', 'serverservice-account.json'];
    for (const file of candidates) {
        try {
            const raw = JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
            const projectId = raw.project_id || raw.projectId;
            const privateKey = raw.private_key || raw.privateKey;
            const clientEmail = raw.client_email || raw.clientEmail;
            if (projectId && privateKey && clientEmail) {
                console.log(`TTS credentials loaded from ${file}`);
                return { projectId, privateKey, clientEmail };
            }
        } catch (e) {
            // File missing or unparsable; try the next candidate.
        }
    }
    return null;
}

// Initialize the TTS client on startup using the local credentials file.
try {
    const fileCredentials = loadCredentialsFromFile();
    if (fileCredentials) {
        initializeClients(fileCredentials);
        console.log('TTS client initialized from credentials file');
    } else {
        console.log('No TTS credentials file found; waiting for credentials from settings');
    }
} catch (error) {
    console.error('Error loading credentials file:', error);
}

// Initialize Firestore for storing user-defined customizations (tones, etc.).
// Locally, load the service-account key from service-account.json.
// On App Engine, omit the file and Application Default Credentials are used.
let firestore = null;
const TONES_COLLECTION = 'customTones';
try {
    const firestoreOptions = {};
    try {
        const saPath = path.join(__dirname, 'service-account.json');
        const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
        firestoreOptions.projectId = sa.project_id;
        firestoreOptions.credentials = sa;
        console.log('Firestore using service-account.json');
    } catch (e) {
        console.log('Firestore using Application Default Credentials');
    }
    firestore = new Firestore(firestoreOptions);
    console.log('Firestore initialized');
} catch (error) {
    console.error('Error initializing Firestore:', error);
}

// Gemini-TTS configuration
const GEMINI_TTS_MODEL = 'gemini-2.5-flash-tts';
const DEFAULT_GEMINI_VOICE = 'Kore';

// Map app language codes to BCP-47 locales supported by Gemini-TTS
const GEMINI_LANGUAGE_CODES = {
    'en': 'en-US',
    'ko': 'ko-KR',
    'ja': 'ja-JP',
    'zh': 'cmn-CN',
    'ar': 'ar-EG',
    'fr': 'fr-FR',
    'es': 'es-ES',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-BR'
};

// Resolve the BCP-47 locale for a given app language code
function getLanguageCode(targetLang) {
    return GEMINI_LANGUAGE_CODES[targetLang] || 'en-US';
}

// Build a Gemini-TTS voice selection. voiceId is a Gemini voice name (e.g. 'Kore').
// Legacy ids like 'en-US-Journey-F' (containing '-') are ignored in favor of the default.
function getVoiceConfig(voiceId, targetLang) {
    const isLegacy = !voiceId || voiceId.includes('-');
    return {
        name: isLegacy ? DEFAULT_GEMINI_VOICE : voiceId,
        languageCode: getLanguageCode(targetLang),
        modelName: GEMINI_TTS_MODEL
    };
}

// Function to synthesize speech with Gemini-TTS
async function synthesizeSpeech(text, targetLang, voiceId, prompt) {
    if (!ttsClient) {
        throw new Error('TTS client not initialized. Please provide valid credentials in settings.');
    }

    try {
        const voiceConfig = getVoiceConfig(voiceId, targetLang);

        // Gemini-TTS accepts an optional style prompt alongside the text.
        const input = { text };
        if (prompt && typeof prompt === 'string' && prompt.trim()) {
            input.prompt = prompt.trim();
        }

        const request = {
            input,
            voice: voiceConfig,
            audioConfig: {
                audioEncoding: 'MP3'
            },
        };

        const [response] = await ttsClient.synthesizeSpeech(request);
        return response.audioContent;
    } catch (error) {
        console.error('TTS error:', error);
        throw error;
    }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('synthesize-speech', async (data) => {
        try {
            const { text, targetLang, voiceId, prompt } = data;
            const audioContent = await synthesizeSpeech(text, targetLang, voiceId, prompt);
            
            // Convert audio content to base64
            const base64Audio = audioContent.toString('base64');
            socket.emit('tts-audio', base64Audio);
        } catch (error) {
            console.error('Error in speech synthesis:', error);
            socket.emit('tts-error', { message: error.message || 'Failed to synthesize speech' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running successfully!' });
});

// ---- Custom config API (user-defined tones/models/languages, shared via Firestore) ----

const requireFirestore = (res) => {
    if (!firestore) {
        res.status(503).json({ error: 'Storage is not available. Firestore is not initialized.' });
        return false;
    }
    return true;
};

const str = (v) => (typeof v === 'string' ? v.trim() : '');

// Per-resource config: collection name, validator (returns error string or null),
// and serializer (Firestore doc -> stored fields). All share id + createdAt.
const RESOURCE_TYPES = {
    tones: {
        collection: TONES_COLLECTION,
        build: (body) => {
            if (!str(body.name)) return { error: 'Tone name is required' };
            return {
                value: {
                    name: str(body.name),
                    description: str(body.description),
                    instruction: str(body.instruction)
                }
            };
        }
    },
    models: {
        collection: 'customModels',
        build: (body) => {
            const name = str(body.name);
            const api = str(body.api);
            const modelSlug = str(body.modelSlug);
            if (!name) return { error: 'Model name is required' };
            if (!['google', 'anthropic', 'openrouter', 'openai'].includes(api)) {
                return { error: 'api must be one of: google, anthropic, openrouter, openai' };
            }
            if (!modelSlug) return { error: 'modelSlug is required' };
            return { value: { name, api, modelSlug } };
        }
    },
    languages: {
        collection: 'customLanguages',
        build: (body) => {
            const code = str(body.code).toLowerCase();
            const name = str(body.name);
            if (!code) return { error: 'Language code is required' };
            if (!name) return { error: 'Language name is required' };
            return { value: { code, name } };
        }
    }
};

const getResource = (req, res) => {
    const resource = RESOURCE_TYPES[req.params.type];
    if (!resource) {
        res.status(404).json({ error: `Unknown resource type: ${req.params.type}` });
        return null;
    }
    return resource;
};

// List all items of a resource type
app.get('/api/custom/:type', async (req, res) => {
    if (!requireFirestore(res)) return;
    const resource = getResource(req, res);
    if (!resource) return;
    try {
        const snapshot = await firestore
            .collection(resource.collection)
            .orderBy('createdAt', 'asc')
            .get();
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), createdAt: undefined }));
        res.json(items);
    } catch (error) {
        console.error(`Error listing ${req.params.type}:`, error);
        res.status(500).json({ error: `Failed to load custom ${req.params.type}`, details: error.message });
    }
});

// Create a new item of a resource type
app.post('/api/custom/:type', async (req, res) => {
    if (!requireFirestore(res)) return;
    const resource = getResource(req, res);
    if (!resource) return;
    try {
        const built = resource.build(req.body || {});
        if (built.error) {
            res.status(400).json({ error: built.error });
            return;
        }
        const doc = { ...built.value, createdAt: Date.now() };
        const ref = await firestore.collection(resource.collection).add(doc);
        res.status(201).json({ id: ref.id, ...built.value });
    } catch (error) {
        console.error(`Error creating ${req.params.type}:`, error);
        res.status(500).json({ error: `Failed to create custom ${req.params.type}`, details: error.message });
    }
});

// Delete an item of a resource type
app.delete('/api/custom/:type/:id', async (req, res) => {
    if (!requireFirestore(res)) return;
    const resource = getResource(req, res);
    if (!resource) return;
    try {
        await firestore.collection(resource.collection).doc(req.params.id).delete();
        res.json({ success: true });
    } catch (error) {
        console.error(`Error deleting ${req.params.type}:`, error);
        res.status(500).json({ error: `Failed to delete custom ${req.params.type}`, details: error.message });
    }
});

// Handle all other routes in production - serve React app
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.sendFile(path.join(__dirname, 'client/build/index.html'));
    });
}

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
