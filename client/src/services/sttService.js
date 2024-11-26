import io from 'socket.io-client';

let socket = null;
let mediaRecorder = null;
let recordedChunks = [];

// Initialize socket connection
const initializeSocket = () => {
    if (!socket) {
        socket = io('http://localhost:5000');
        console.log('Socket connection initialized for STT');
    }
    return socket;
};

// Update Azure credentials on the server
export const updateSTTCredentials = async (credentials) => {
    const socket = initializeSocket();
    return new Promise((resolve, reject) => {
        socket.emit('update-stt-credentials', credentials);
        
        const onSuccess = () => {
            socket.off('stt-credentials-updated');
            socket.off('stt-credentials-error');
            resolve();
        };

        const onError = (error) => {
            socket.off('stt-credentials-updated');
            socket.off('stt-credentials-error');
            reject(new Error(error.message));
        };

        socket.on('stt-credentials-updated', onSuccess);
        socket.on('stt-credentials-error', onError);
    });
};

// Start recording audio
export const startRecording = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            recordedChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.start();
            resolve();
        } catch (error) {
            reject(error);
        }
    });
};

// Stop recording and transcribe
export const stopRecording = () => {
    return new Promise((resolve, reject) => {
        if (!mediaRecorder) {
            reject(new Error('No recording in progress'));
            return;
        }

        const socket = initializeSocket();

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
            const reader = new FileReader();

            reader.onload = () => {
                const base64Audio = reader.result.split(',')[1];
                socket.emit('transcribe-speech', { audioData: base64Audio });
            };

            reader.readAsDataURL(audioBlob);
        };

        const onTranscription = (result) => {
            socket.off('transcription-result', onTranscription);
            socket.off('transcription-error', onTranscriptionError);
            resolve(result.text);
        };

        const onTranscriptionError = (error) => {
            socket.off('transcription-result', onTranscription);
            socket.off('transcription-error', onTranscriptionError);
            reject(new Error(error.message));
        };

        socket.on('transcription-result', onTranscription);
        socket.on('transcription-error', onTranscriptionError);

        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        mediaRecorder = null;
    });
};
