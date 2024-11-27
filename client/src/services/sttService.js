import io from 'socket.io-client';
import config from '../config';

let socket = null;
let mediaRecorder = null;
let audioContext = null;
let audioInput = null;
let processor = null;
let mediaStream = null;
const bufferSize = 2048;
let isRecording = false;

// Initialize socket connection
const initializeSocket = () => {
    if (!socket) {
        socket = io(config.serverUrl, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        console.log('Socket connection initialized for STT');
    }
    return socket;
};

// Initialize audio context
async function initAudioContext() {
    try {
        console.log('Requesting microphone access...');
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                channelCount: 1,
                sampleRate: 16000,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        });
        console.log('Microphone access granted');
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 16000,
            latencyHint: 'interactive'
        });
        
        audioInput = audioContext.createMediaStreamSource(mediaStream);
        processor = audioContext.createScriptProcessor(bufferSize, 1, 1);

        processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Convert Float32Array to Int16Array
            const int16Data = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                // Convert float to int16
                const s = Math.max(-1, Math.min(1, inputData[i]));
                int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            
            // Send the buffer
            if (socket && isRecording) {
                socket.emit('audioData', int16Data.buffer);
            }
        };

        audioInput.connect(processor);
        processor.connect(audioContext.destination);
        console.log('Audio context initialized with sample rate:', audioContext.sampleRate);
    } catch (err) {
        console.error('Error accessing microphone:', err);
        throw new Error('Error accessing microphone. Please ensure microphone permissions are granted.');
    }
}

// Start recording audio
export const startRecording = (sourceLanguage = null) => {
    return new Promise(async (resolve, reject) => {
        try {
            const socket = initializeSocket();
            
            if (!audioContext) {
                await initAudioContext();
            } else if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            
            audioInput.connect(processor);
            processor.connect(audioContext.destination);

            socket.emit('startGoogleCloudStream', { sourceLanguage });
            isRecording = true;
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

// Stop recording
export const stopRecording = () => {
    return new Promise((resolve, reject) => {
        try {
            if (!isRecording) {
                reject(new Error('No recording in progress'));
                return;
            }

            const socket = initializeSocket();
            socket.emit('endGoogleCloudStream');

            if (audioInput && processor) {
                audioInput.disconnect(processor);
                processor.disconnect(audioContext.destination);
            }

            // Stop all tracks in the media stream
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => {
                    track.stop();
                });
                mediaStream = null;
            }

            // Reset audio context
            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }

            isRecording = false;
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

// Subscribe to transcription updates
export const onTranscription = (callback) => {
    const socket = initializeSocket();
    socket.on('transcription', callback);
    return () => socket.off('transcription', callback);
};

// Subscribe to recording stopped events
export const onRecordingStopped = (callback) => {
    const socket = initializeSocket();
    socket.on('recordingStopped', callback);
    return () => socket.off('recordingStopped', callback);
};

// Subscribe to time remaining updates
export const onTimeRemaining = (callback) => {
    const socket = initializeSocket();
    socket.on('timeRemaining', callback);
    return () => socket.off('timeRemaining', callback);
};

// Subscribe to error events
export const onError = (callback) => {
    const socket = initializeSocket();
    socket.on('error', callback);
    return () => socket.off('error', callback);
};
