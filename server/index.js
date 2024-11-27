require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const textToSpeech = require('@google-cloud/text-to-speech');
const speech = require('@google-cloud/speech');
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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));
}

// Initialize clients
let ttsClient = null;
let speechClient = null;

// Language code mapping for Google Cloud Speech-to-Text
const languageCodeMap = {
    'en': 'en-US',
    'fr': 'fr-FR',
    'es': 'es-ES',
    'it': 'it-IT',
    'de': 'de-DE',
    'pt': 'pt-BR',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'zh': 'zh-CN',
    'ar': 'ar-SA'
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

        // Initialize Speech client with credentials
        speechClient = new speech.SpeechClient({
            credentials: googleCredentials
        });
        
        console.log('Successfully initialized clients');
        return { ttsClient, speechClient };
    } catch (error) {
        console.error('Error initializing clients:', error);
        return null;
    }
}

// Load TTS credentials from file and initialize on startup
try {
    const ttsCredentialsPath = path.join(__dirname, 'tts-credentials.json');
    const ttsCredentials = JSON.parse(fs.readFileSync(ttsCredentialsPath, 'utf8'));
    initializeClients(ttsCredentials);
    console.log('Clients initialized from credentials file');
} catch (error) {
    console.error('Error loading credentials files:', error);
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
    
    let recognizeStream = null;
    let isStreamActive = false;
    let streamRestartTimeout;
    let totalDurationTimeout;
    let silenceTimeout = null;
    const STREAM_TIMEOUT = 240000; // 4 minutes
    const TOTAL_DURATION_LIMIT = 7200000; // 2 hours
    const SILENCE_TIMEOUT = 1500; // 1.5 seconds of silence before finalizing

    // Function to create a new recognize stream
    const createRecognizeStream = (sourceLanguage = null) => {
        console.log('Starting new recognize stream...');
        
        if (!speechClient) {
            throw new Error('Speech client not initialized. Please provide valid credentials in settings.');
        }

        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            model: 'default',
            useEnhanced: true,
            enableAutomaticPunctuation: true,
            metadata: {
                interactionType: 'DICTATION',
                microphoneDistance: 'NEARFIELD',
                recordingDeviceType: 'PC_MIC',
            },
            enableWordTimeOffsets: true,
            speechContexts: [{
                phrases: [".", "!", "?", ",", ";", ":", "\n", "\n\n"],
                boost: 20
            }]
        };

        // If sourceLanguage is null (auto-detect) or 'auto', enable language detection
        if (!sourceLanguage || sourceLanguage === 'auto') {
            console.log('Using automatic language detection');
            config.languageCode = 'en-US';  // Required default even with auto-detection
            config.alternativeLanguageCodes = Object.values(languageCodeMap);
        } else {
            // Use specific language if provided
            const languageCode = languageCodeMap[sourceLanguage] || 'en-US';
            console.log('Using specific language:', languageCode);
            config.languageCode = languageCode;
        }

        const request = {
            config,
            interimResults: true
        };

        let lastTranscriptTime = Date.now();

        recognizeStream = speechClient
            .streamingRecognize(request)
            .on('error', (error) => {
                console.error('Error in recognize stream:', error);
                socket.emit('error', 'Speech recognition error: ' + error.message);
                
                if (error.code === 11 && isStreamActive) {
                    console.log('Stream timed out, restarting...');
                    createRecognizeStream(sourceLanguage);
                } else {
                    isStreamActive = false;
                }
            })
            .on('data', (data) => {
                if (data.results[0] && data.results[0].alternatives[0]) {
                    const transcript = data.results[0].alternatives[0].transcript;
                    const isFinal = data.results[0].isFinal;
                    const detectedLanguage = data.results[0].languageCode;
                    
                    lastTranscriptTime = Date.now();
                    
                    // Clear any existing silence timeout
                    if (silenceTimeout) {
                        clearTimeout(silenceTimeout);
                        silenceTimeout = null;
                    }
                    
                    socket.emit('transcription', {
                        text: transcript,
                        isFinal: isFinal,
                        detectedLanguage: detectedLanguage
                    });

                    // Set a new silence timeout if this is not a final result
                    if (!isFinal) {
                        silenceTimeout = setTimeout(() => {
                            if (Date.now() - lastTranscriptTime >= SILENCE_TIMEOUT) {
                                // Force the current transcription to be finalized
                                recognizeStream.end();
                                createRecognizeStream(sourceLanguage);
                            }
                        }, SILENCE_TIMEOUT);
                    }
                }
            })
            .on('end', () => {
                console.log('Recognize stream ended');
                if (isStreamActive) {
                    createRecognizeStream(sourceLanguage);
                }
            });

        // Set up automatic stream restart before timeout
        clearTimeout(streamRestartTimeout);
        streamRestartTimeout = setTimeout(() => {
            if (isStreamActive) {
                console.log('Preemptively restarting stream before timeout...');
                const oldStream = recognizeStream;
                createRecognizeStream(sourceLanguage); // Create new stream first
                oldStream.end(); // Then end the old stream
            }
        }, STREAM_TIMEOUT);

        return recognizeStream;
    };

    // Function to stop recording
    const stopRecording = (reason) => {
        if (recognizeStream && isStreamActive) {
            isStreamActive = false;
            clearTimeout(streamRestartTimeout);
            clearTimeout(totalDurationTimeout);
            clearTimeout(silenceTimeout);
            recognizeStream.end();
            socket.emit('recordingStopped', { reason: reason });
            console.log('Recording stopped:', reason);
        }
    };

    socket.on('startGoogleCloudStream', async (data) => {
        try {
            isStreamActive = true;
            const sourceLanguage = data?.sourceLanguage || null;
            createRecognizeStream(sourceLanguage);
            console.log('Successfully created recognize stream');

            // Set up total duration limit
            clearTimeout(totalDurationTimeout);
            totalDurationTimeout = setTimeout(() => {
                stopRecording('Recording limit of 2 hours reached');
            }, TOTAL_DURATION_LIMIT);

            // Emit time remaining updates every minute
            let timeRemaining = TOTAL_DURATION_LIMIT;
            const updateInterval = setInterval(() => {
                if (!isStreamActive) {
                    clearInterval(updateInterval);
                    return;
                }
                timeRemaining -= 60000; // Subtract one minute
                const minutesRemaining = Math.floor(timeRemaining / 60000);
                if (minutesRemaining <= 5) {
                    socket.emit('timeRemaining', { minutes: minutesRemaining });
                }
            }, 60000);

        } catch (error) {
            console.error('Error creating recognize stream:', error);
            socket.emit('error', 'Failed to start speech recognition: ' + error.message);
            isStreamActive = false;
        }
    });

    socket.on('audioData', (data) => {
        if (recognizeStream && isStreamActive && !recognizeStream.destroyed) {
            try {
                const buffer = Buffer.from(data);
                recognizeStream.write(buffer);
            } catch (error) {
                console.error('Error writing to recognize stream:', error);
                socket.emit('error', 'Error processing audio: ' + error.message);
                isStreamActive = false;
            }
        }
    });

    socket.on('endGoogleCloudStream', () => {
        stopRecording('Recording manually stopped');
    });

    // Handle TTS credentials update
    socket.on('update-tts-credentials', (credentials) => {
        try {
            console.log('Received credentials update request');
            const clients = initializeClients(credentials);
            if (clients) {
                ttsClient = clients.ttsClient;
                speechClient = clients.speechClient;
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

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        stopRecording('Client disconnected');
    });
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is running successfully!' });
});

// Handle all other routes in production - serve React app
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build/index.html'));
    });
}

// Start server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
