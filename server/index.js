require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const textToSpeech = require('@google-cloud/text-to-speech');
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
        etag: true, // Enable ETag
        lastModified: true, // Enable Last-Modified
        setHeaders: (res, path) => {
            // For HTML files - no cache
            if (path.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
            }
            // For JS, CSS, and other static assets - cache for 1 hour but validate
            else {
                res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
            }
        }
    }));
}

// Initialize TTS client
let ttsClient = null;

function initializeClients(credentials) {
    try {
        if (!credentials.projectId || !credentials.privateKey || !credentials.clientEmail) {
            console.log('Missing required credentials:', {
                hasProjectId: !!credentials.projectId,
                hasPrivateKey: !!credentials.privateKey,
                hasClientEmail: !!credentials.clientEmail
            });
            return null;
        }

        // Create credentials object for Google Cloud
        const googleCredentials = {
            type: "service_account",
            project_id: credentials.projectId,
            private_key: credentials.privateKey.replace(/\\n/g, '\n'),
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
        return null;
    }
}

// Load TTS credentials from file and initialize on startup
try {
    const ttsCredentialsPath = path.join(__dirname, 'tts-credentials.json');
    const ttsCredentials = JSON.parse(fs.readFileSync(ttsCredentialsPath, 'utf8'));
    initializeClients(ttsCredentials);
    console.log('TTS client initialized from credentials file');
} catch (error) {
    console.error('Error loading credentials file:', error);
}

// Helper function to get voice configuration
function getVoiceConfig(voiceId) {
    const [langCode, countryCode, model] = voiceId.split('-');
    const languageCode = `${langCode}-${countryCode}`;

    return {
        name: voiceId,
        languageCode: languageCode,
        model: model.includes('Neural2') ? 'Neural2' : 
               model.includes('Wavenet') ? 'Wavenet' : 
               'Journey'
    };
}

// Function to synthesize speech
async function synthesizeSpeech(text, targetLang, voiceId) {
    if (!ttsClient) {
        throw new Error('TTS client not initialized. Please provide valid credentials in settings.');
    }

    try {
        const voiceConfig = getVoiceConfig(voiceId || getDefaultVoice(targetLang));
        
        const request = {
            input: { text: text },
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

// Function to get default voice for a language
function getDefaultVoice(targetLang) {
    const defaultVoices = {
        'en': 'en-US-Journey-F',
        'ko': 'ko-KR-Neural2-A',
        'ja': 'ja-JP-Neural2-B',
        'zh': 'zh-CN-Wavenet-A',
        'ar': 'ar-XA-Wavenet-A',
        'fr': 'fr-FR-Journey-F',
        'es': 'es-ES-Journey-F',
        'it': 'it-IT-Journey-F',
        'de': 'de-DE-Journey-F',
        'pt': 'pt-BR-Neural2-A'
    };
    return defaultVoices[targetLang] || 'en-US-Journey-F';
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected');

    // Handle TTS credentials update
    socket.on('update-tts-credentials', (credentials) => {
        try {
            console.log('Received credentials update request');
            const clients = initializeClients(credentials);
            if (clients) {
                ttsClient = clients.ttsClient;
                console.log('TTS client initialized successfully');
                socket.emit('tts-credentials-updated', { success: true });
            } else {
                console.error('Failed to initialize TTS client');
                socket.emit('tts-credentials-updated', { 
                    success: false, 
                    error: 'Failed to initialize client with provided credentials' 
                });
            }
        } catch (error) {
            console.error('Error updating credentials:', error);
            socket.emit('tts-credentials-updated', { 
                success: false, 
                error: error.message 
            });
        }
    });

    socket.on('synthesize-speech', async (data) => {
        try {
            const { text, targetLang, voiceId } = data;
            const audioContent = await synthesizeSpeech(text, targetLang, voiceId);
            
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

// Handle all other routes in production - serve React app
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        // Add cache control headers for index.html
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
