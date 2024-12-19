let recognition = null;
let isRecording = false;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Store event handlers
let eventHandlers = {
    result: null,
    end: null,
    error: null
};

// Initialize speech recognition
const initializeSpeechRecognition = (sourceLanguage = null) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        throw new Error('Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.');
    }

    // Cleanup existing instance
    if (recognition) {
        recognition.abort();
        recognition.onend = null;
        recognition.onresult = null;
        recognition.onerror = null;
        recognition = null;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    if (sourceLanguage) {
        recognition.lang = sourceLanguage;
    }

    // Attach any registered event handlers
    if (eventHandlers.result) recognition.addEventListener('result', eventHandlers.result);
    if (eventHandlers.end) recognition.addEventListener('end', eventHandlers.end);
    if (eventHandlers.error) recognition.addEventListener('error', eventHandlers.error);

    return recognition;
};

// Helper to handle retries
const handleRetry = (error, retryFn) => {
    const retryableErrors = ['network', 'no-speech', 'audio-capture'];
    if (retryableErrors.includes(error) && retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(() => {
            retryFn();
        }, RETRY_DELAY * retryCount);
        return true;
    }
    retryCount = 0;
    return false;
};

// Helper to register event handlers
const registerEventHandler = (eventName, handler) => {
    eventHandlers[eventName] = handler;
    // If recognition is active, attach the handler immediately
    if (recognition) {
        recognition.addEventListener(eventName, handler);
    }
    return () => {
        if (eventHandlers[eventName] === handler) {
            if (recognition) {
                recognition.removeEventListener(eventName, handler);
            }
            eventHandlers[eventName] = null;
        }
    };
};

// Start recording audio
export const startRecording = (sourceLanguage = null) => {
    return new Promise((resolve, reject) => {
        try {
            if (isRecording) {
                reject(new Error('Recording already in progress'));
                return;
            }

            recognition = initializeSpeechRecognition(sourceLanguage);
            
            // Simple end handler since we don't auto-restart
            recognition.onend = () => {
                isRecording = false;
            };

            recognition.start();
            isRecording = true;
            retryCount = 0;
            resolve();
        } catch (error) {
            reject(new Error(`Failed to start recording: ${error.message}`));
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
                recognition.onend = null;
                recognition.onresult = null;
                recognition.onerror = null;
                recognition = null;
            }
            isRecording = false;
            retryCount = 0;
            resolve();
        } catch (error) {
            reject(new Error(`Failed to stop recording: ${error.message}`));
        }
    });
};

// Subscribe to transcription updates
export const onTranscription = (callback) => {
    const handleResult = (event) => {
        if (!recognition) return;
        
        try {
            // Get only the latest result
            const currentResult = event.results[event.results.length - 1];
            const transcript = currentResult[0].transcript.trim();

            callback({
                transcript,
                isFinal: currentResult.isFinal
            });

            // Automatically stop recording when we get a final result
            if (currentResult.isFinal) {
                stopRecording().catch(console.error);
            }
        } catch (error) {
            console.error('Error processing transcription:', error);
        }
    };

    return registerEventHandler('result', handleResult);
};

// Subscribe to recording stopped events
export const onRecordingStopped = (callback) => {
    const handleEnd = () => {
        if (!recognition || !isRecording) {
            callback();
        }
    };

    return registerEventHandler('end', handleEnd);
};

// Subscribe to error events
export const onError = (callback) => {
    const handleError = (event) => {
        if (!recognition) return;
        
        const errorMessages = {
            'network': 'Network error occurred. Please check your internet connection.',
            'no-speech': 'No speech detected. Please try again.',
            'audio-capture': 'No microphone detected. Please ensure a microphone is connected.',
            'not-allowed': 'Microphone permission denied. Please allow microphone access.',
            'aborted': 'Recording was aborted.',
            'language-not-supported': 'The selected language is not supported.',
            'service-not-allowed': 'Speech recognition service is not allowed.',
            'bad-grammar': 'Grammar error occurred.',
        };

        const errorMessage = errorMessages[event.error] || `Recognition error: ${event.error}`;
        
        if (!handleRetry(event.error, () => {
            if (isRecording) {
                recognition?.start();
            }
        })) {
            callback(errorMessage);
        }
    };

    return registerEventHandler('error', handleError);
};
