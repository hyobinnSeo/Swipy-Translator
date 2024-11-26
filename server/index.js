require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const textToSpeech = require('@google-cloud/text-to-speech');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
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

// Initialize TTS client and Azure config
let ttsClient = null;
let azureConfig = {
    subscriptionKey: process.env.AZURE_SPEECH_KEY || '',
    region: process.env.AZURE_SPEECH_REGION || ''
};

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

        // Create credentials object for Google TTS
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
        
        console.log('Successfully initialized clients');
        return { ttsClient };
    } catch (error) {
        console.error('Error initializing clients:', error);
        return null;
    }
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

// Function to transcribe speech using Azure
async function transcribeSpeech(audioContent) {
    if (!azureConfig.subscriptionKey || !azureConfig.region) {
        throw new Error('Azure Speech config not initialized. Please check credentials in settings.');
    }

    return new Promise((resolve, reject) => {
        try {
            // Create the push stream
            const pushStream = sdk.AudioInputStream.createPushStream();

            // Convert base64 to buffer and push to stream
            const audioBuffer = Buffer.from(audioContent, 'base64');
            pushStream.write(audioBuffer);
            pushStream.close();

            // Create the audio config from the stream
            const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
            
            // Create the speech config
            const speechConfig = sdk.SpeechConfig.fromSubscription(
                azureConfig.subscriptionKey,
                azureConfig.region
            );

            // Create the speech recognizer
            const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

            // Start recognition
            recognizer.recognizeOnceAsync(
                result => {
                    if (result.text) {
                        resolve(result.text);
                    } else {
                        reject(new Error('No speech detected'));
                    }
                    recognizer.close();
                },
                error => {
                    console.error('Speech recognition error:', error);
                    recognizer.close();
                    reject(error);
                }
            );
        } catch (error) {
            console.error('Error in speech transcription setup:', error);
            reject(error);
        }
    });
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

    // Handle Azure STT credentials update
    socket.on('update-stt-credentials', (credentials) => {
        try {
            console.log('Received Azure credentials update request');
            if (!credentials.subscriptionKey || !credentials.region) {
                throw new Error('Missing required Azure credentials');
            }

            azureConfig = {
                subscriptionKey: credentials.subscriptionKey,
                region: credentials.region
            };

            console.log('Azure credentials updated successfully');
            socket.emit('stt-credentials-updated', { success: true });
        } catch (error) {
            console.error('Error updating Azure credentials:', error);
            socket.emit('stt-credentials-error', { 
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
