let recognition = null;
let isRecording = false;

// Initialize speech recognition
const initializeSpeechRecognition = (sourceLanguage = null) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser.');
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    if (sourceLanguage) {
        recognition.lang = sourceLanguage;
    }

    return recognition;
};

// Start recording audio
export const startRecording = (sourceLanguage = null) => {
    return new Promise((resolve, reject) => {
        try {
            if (isRecording) {
                reject(new Error('Recording already in progress'));
                return;
            }

            const recognition = initializeSpeechRecognition(sourceLanguage);
            recognition.start();
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

            if (recognition) {
                recognition.stop();
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
    if (!recognition) {
        initializeSpeechRecognition();
    }

    const handleResult = (event) => {
        const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
        
        callback({ transcript });
    };

    recognition.addEventListener('result', handleResult);
    return () => recognition.removeEventListener('result', handleResult);
};

// Subscribe to recording stopped events
export const onRecordingStopped = (callback) => {
    if (!recognition) {
        initializeSpeechRecognition();
    }

    const handleEnd = () => {
        isRecording = false;
        callback();
    };

    recognition.addEventListener('end', handleEnd);
    return () => recognition.removeEventListener('end', handleEnd);
};

// Subscribe to error events
export const onError = (callback) => {
    if (!recognition) {
        initializeSpeechRecognition();
    }

    const handleError = (event) => {
        callback(event.error);
    };

    recognition.addEventListener('error', handleError);
    return () => recognition.removeEventListener('error', handleError);
};

// Note: timeRemaining functionality is removed since it's not applicable 
// with browser-based speech recognition
