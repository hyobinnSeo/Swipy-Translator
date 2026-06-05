// Initialize socket.io client
import io from 'socket.io-client';
import { LANGUAGE_VOICE_MAPPING } from '../constants';
import config from '../config';

let socket = null;
let playbackContext = null;
let currentAudioSource = null;

// Initialize socket connection
export const initializeSocket = () => {
    if (!socket) {
        socket = io(config.serverUrl);
        console.log('Socket connection initialized');
    }
    return socket;
};

// Initialize playback context for TTS
const initPlaybackContext = () => {
    if (!playbackContext) {
        playbackContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return playbackContext;
};

// Function to stop current TTS playback
export const stopTTS = () => {
    if (currentAudioSource) {
        currentAudioSource.stop();
        currentAudioSource.disconnect();
        currentAudioSource = null;
    }
};

// Function to update TTS credentials
export const updateTTSCredentials = (credentials) => {
    return new Promise((resolve, reject) => {
        const { googleCloud } = credentials;
        
        if (!googleCloud?.projectId || !googleCloud?.privateKey || !googleCloud?.clientEmail) {
            reject(new Error('Missing required credentials'));
            return;
        }

        const socket = initializeSocket();

        const onCredentialsUpdated = (response) => {
            socket.off('tts-credentials-updated', onCredentialsUpdated);
            if (response.success) {
                resolve();
            } else {
                reject(new Error(response.error || 'Failed to update TTS credentials'));
            }
        };

        // Add timeout to prevent hanging
        const timeout = setTimeout(() => {
            socket.off('tts-credentials-updated', onCredentialsUpdated);
            reject(new Error('Verification timeout - no response from server'));
        }, 10000);

        socket.on('tts-credentials-updated', (response) => {
            clearTimeout(timeout);
            onCredentialsUpdated(response);
        });

        // Format and send credentials
        const formattedCredentials = {
            projectId: googleCloud.projectId,
            privateKey: googleCloud.privateKey.replace(/\\n/g, '\n'),
            clientEmail: googleCloud.clientEmail
        };

        socket.emit('update-tts-credentials', formattedCredentials);
    });
};

// Function to play TTS audio
const playTTSAudio = async (base64Audio) => {
    try {
        stopTTS(); // Stop any existing playback
        const context = initPlaybackContext();
        
        // Convert base64 to array buffer
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Decode the audio data
        const audioBuffer = await context.decodeAudioData(bytes.buffer);
        
        // Create and play the audio
        const source = context.createBufferSource();
        currentAudioSource = source;
        source.buffer = audioBuffer;
        source.connect(context.destination);
        source.start(0);
        
        return new Promise((resolve) => {
            source.onended = () => {
                source.disconnect();
                if (currentAudioSource === source) {
                    currentAudioSource = null;
                }
                resolve();
            };
        });
    } catch (error) {
        console.error('Error playing TTS audio:', error);
        throw error;
    }
};

// Browser's native TTS implementation
const playBrowserTTS = (text, targetLang) => {
    return new Promise((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = targetLang;
        
        utterance.onend = () => resolve();
        utterance.onerror = (error) => reject(error);
        
        window.speechSynthesis.speak(utterance);
    });
};

// Get the stored voice preference or default voice for a language
const getVoiceForLanguage = (targetLang) => {
    // Try to get stored voice preference (saved by the app under 'voiceSettings')
    try {
        const storedVoices = localStorage.getItem('voiceSettings');
        if (storedVoices) {
            const voices = JSON.parse(storedVoices);
            if (voices[targetLang]) {
                return voices[targetLang];
            }
        }
    } catch {
        // Ignore malformed stored value and fall back to default
    }
    // Return default voice if no stored preference
    return LANGUAGE_VOICE_MAPPING[targetLang];
};

// Function to request speech synthesis
export const synthesizeSpeech = async (text, targetLang) => {
    // Check if Google Cloud TTS is enabled
    const useGoogleTTS = localStorage.getItem('useGoogleCloudTTS') === 'true';
    
    if (!useGoogleTTS) {
        // Use browser's native TTS
        return playBrowserTTS(text, targetLang);
    }

    // Get stored API keys
    const apiKeysStr = localStorage.getItem('apiKeys');
    if (!apiKeysStr) {
        throw new Error('Please configure Google Cloud credentials in settings to use Google Cloud TTS');
    }

    const apiKeys = JSON.parse(apiKeysStr);
    const { googleCloud } = apiKeys;
    
    if (!googleCloud?.projectId || !googleCloud?.privateKey || !googleCloud?.clientEmail) {
        throw new Error('Please configure Google Cloud credentials in settings to use Google Cloud TTS');
    }

    return new Promise((resolve, reject) => {
        const socket = initializeSocket();

        // Get the appropriate voice for the target language
        const voiceId = getVoiceForLanguage(targetLang);

        // Set up event listeners
        const onTTSAudio = (base64Audio) => {
            playTTSAudio(base64Audio)
                .then(() => {
                    resolve();
                    cleanup();
                })
                .catch(error => {
                    reject(error);
                    cleanup();
                });
        };

        const onTTSError = (error) => {
            reject(new Error(error.message));
            cleanup();
        };

        const cleanup = () => {
            socket.off('tts-audio', onTTSAudio);
            socket.off('tts-error', onTTSError);
        };

        // Register event listeners
        socket.on('tts-audio', onTTSAudio);
        socket.on('tts-error', onTTSError);

        // Send synthesis request with voice ID
        socket.emit('synthesize-speech', { 
            text, 
            targetLang,
            voiceId
        });
    });
};
