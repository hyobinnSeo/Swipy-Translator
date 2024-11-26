require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const textToSpeech = require('@google-cloud/text-to-speech');
const speech = require('@google-cloud/speech');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize TTS and STT clients with credentials from environment
let ttsClient = null;
let sttClient = null;

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

        // Create credentials object in the format expected by the Google Cloud client
        const googleCredentials = {
            type: "service_account",
            project_id: credentials.projectId,
            private_key: credentials.privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
            client_email: credentials.clientEmail,
            // Add required but unused fields
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
        
        // Initialize STT client with credentials
        sttClient = new speech.SpeechClient({
            credentials: googleCredentials
        });
        
        console.log('Successfully initialized Google Cloud clients');
        return { ttsClient, sttClient };
    } catch (error) {
        console.error('Error initializing Google Cloud clients:', error);
        return null;
    }
}

// Helper function to get voice configuration
function getVoiceConfig(voiceId) {
    // Extract language code and voice model from voice ID
    // Example voiceId: 'en-US-Journey-F'
    const [langCode, countryCode, model] = voiceId.split('-');
    const languageCode = `${langCode}-${countryCode}`;

    return {
        name: voiceId,
        languageCode: languageCode,
        // Some voices use Neural2 or Wavenet models
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

// Function to transcribe speech
async function transcribeSpeech(audioContent) {
    if (!sttClient) {
        console.error('STT Client Status:', {
            clientExists: !!sttClient,
            ttsClientExists: !!ttsClient // Log TTS client status for comparison
        });
        throw new Error('STT client not initialized. Please provide valid credentials in settings.');
    }

    try {
        const audio = {
            content: audioContent
        };
        
        const config = {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
        };
        
        const request = {
            audio: audio,
            config: config,
        };

        console.log('Attempting STT recognition with config:', config);
        const [response] = await sttClient.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
            
        return transcription;
    } catch (error) {
        console.error('STT error details:', error);
        throw error;
    }
}

// Function to get default voice for a language
function getDefaultVoice(targetLang) {
    const defaultVoices = {
        'en': 'en-US-Journey-F',
        'ko': 'ko-KR-Neural2-A',
        'ja': 'ja-JP-Neural2-B',
        'zh': 'cmn-TW-Wavenet-A',
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

    // Handle credentials update
    socket.on('update-tts-credentials', (credentials) => {
        try {
            console.log('Received credentials update request');
            const clients = initializeClients(credentials);
            if (clients) {
                ttsClient = clients.ttsClient;
                sttClient = clients.sttClient;
                console.log('Clients initialized successfully');
                socket.emit('tts-credentials-updated', { success: true });
            } else {
                console.error('Failed to initialize clients');
                socket.emit('tts-credentials-updated', { 
                    success: false, 
                    error: 'Failed to initialize clients with provided credentials' 
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

    socket.on('transcribe-speech', async (data) => {
        try {
            console.log('Received transcribe-speech request');
            const { audioData } = data;
            const transcription = await transcribeSpeech(audioData);
            console.log('Transcription completed:', transcription);
            socket.emit('transcription-result', { text: transcription });
        } catch (error) {
            console.error('Error in speech transcription:', error);
            socket.emit('transcription-error', { message: error.message || 'Failed to transcribe speech' });
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

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
