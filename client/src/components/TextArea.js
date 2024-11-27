import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Clipboard, ChevronLeft, ChevronRight, Volume2, Mic } from 'lucide-react';
import { synthesizeSpeech, stopTTS } from '../services/ttsService';
import { startRecording, stopRecording, onTranscription } from '../services/sttService';

const TextArea = ({
    value = '',
    onChange,
    placeholder,
    readOnly = false,
    className = '',
    showSpeaker = false,
    maxLength,
    onClear,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    translations = [],
    currentIndex = 0,
    onPrevious,
    onNext,
    isOutput = false,
    language = 'en',
    selectedVoice,
    isFixedSize = false,
    darkMode = false
}) => {
    const textareaRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const adjustmentTimeoutRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');

    // Subscribe to transcription updates
    useEffect(() => {
        if (isRecording) {
            const unsubscribe = onTranscription((data) => {
                if (data && data.text) {
                    if (data.isFinal) {
                        // For final results, append to the current transcript
                        setCurrentTranscript(prev => {
                            const newTranscript = prev ? `${prev}\n${data.text}` : data.text;
                            onChange({ target: { value: newTranscript } });
                            return newTranscript;
                        });
                        setInterimTranscript('');
                    } else {
                        // For interim results, update the interim transcript
                        setInterimTranscript(data.text);
                    }
                }
            });
            return () => {
                unsubscribe();
                setInterimTranscript('');
            };
        } else {
            setInterimTranscript('');
        }
    }, [isRecording, onChange]);

    const handleSpeak = useCallback(async () => {
        if (!value) return;

        if (isSpeaking) {
            stopTTS();
            setIsSpeaking(false);
            return;
        }

        try {
            setIsSpeaking(true);
            await synthesizeSpeech(value, language);
        } catch (error) {
            console.error('TTS error:', error);
        } finally {
            setIsSpeaking(false);
        }
    }, [value, language, isSpeaking]);

    const handleVoiceInput = useCallback(async () => {
        if (isRecording) {
            try {
                // Save the current transcript and any interim transcript before stopping
                const finalTranscript = currentTranscript + (interimTranscript ? '\n' + interimTranscript : '');
                setIsRecording(false);
                await stopRecording();
                // Update the value with the saved transcript
                onChange({ target: { value: finalTranscript } });
                setCurrentTranscript(finalTranscript);
                setInterimTranscript('');
            } catch (error) {
                console.error('Voice input error:', error);
            }
        } else {
            try {
                const sourceLanguage = language === 'auto' ? null : language;
                setCurrentTranscript('');
                onChange({ target: { value: '' } });
                await startRecording(sourceLanguage);
                setIsRecording(true);
            } catch (error) {
                console.error('Failed to start recording:', error);
            }
        }
    }, [isRecording, onChange, language, currentTranscript, interimTranscript]);

    // Height adjustment logic
    const adjustHeight = useCallback(() => {
        if (!textareaRef.current || isFixedSize) return;

        if (adjustmentTimeoutRef.current) {
            cancelAnimationFrame(adjustmentTimeoutRef.current);
        }

        adjustmentTimeoutRef.current = requestAnimationFrame(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const scrollPos = window.scrollY;
            textarea.style.height = 'auto';
            const newHeight = Math.max(192, textarea.scrollHeight);
            textarea.style.height = `${newHeight}px`;
            textarea.style.overflowY = textarea.scrollHeight <= newHeight ? 'hidden' : 'auto';
            window.scrollTo(0, scrollPos);
        });
    }, [isFixedSize]);

    // Initialize ResizeObserver
    useEffect(() => {
        if (!textareaRef.current) return;

        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
        }

        resizeObserverRef.current = new ResizeObserver(() => {
            requestAnimationFrame(adjustHeight);
        });

        resizeObserverRef.current.observe(textareaRef.current);

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
            if (adjustmentTimeoutRef.current) {
                cancelAnimationFrame(adjustmentTimeoutRef.current);
            }
            stopTTS();
        };
    }, [adjustHeight]);

    useEffect(() => {
        adjustHeight();
    }, [value, adjustHeight]);

    // Handle input/paste events
    const handleInput = (e) => {
        if (readOnly) return;

        const newValue = e.target.value;
        if (!maxLength || newValue.length <= maxLength) {
            onChange(e);
        }
    };

    // Handle paste event
    const handlePaste = (e) => {
        if (readOnly) return;

        const pastedText = e.clipboardData.getData('text');
        const currentValue = value || '';
        const availableSpace = maxLength - currentValue.length + (e.target.selectionEnd - e.target.selectionStart);

        if (pastedText.length > availableSpace) {
            e.preventDefault();
            const newText = currentValue.slice(0, e.target.selectionStart) +
                pastedText.slice(0, availableSpace) +
                currentValue.slice(e.target.selectionEnd);
            onChange({ target: { value: newText } });
        }
    };

    // Handle paste from clipboard button
    const handlePasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            const event = {
                target: {
                    value: text.slice(0, maxLength || text.length)
                }
            };
            handleInput(event);
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    const shouldShowSpeaker = showSpeaker && value && language !== 'auto';

    const containerClasses = `relative rounded-lg border focus-within:ring-2 focus-within:ring-gray-600 focus-within:border-navy-600 transition-all overflow-hidden ${darkMode ? 'bg-navy-900 border-navy-800' : 'bg-white'}`;

    const textareaClasses = `w-full px-4 py-4 text-lg resize-none rounded-lg 
        focus:outline-none border-0 ${darkMode
            ? 'bg-gray-700 text-gray-100 placeholder-gray-400'
            : 'bg-white placeholder-gray-500'
        } ${readOnly ? darkMode ? 'bg-gray-800' : 'bg-gray-50' : ''} ${className}`;

    // Combine the current value with interim transcript for display
    const displayValue = isRecording 
        ? (currentTranscript + (interimTranscript ? '\n' + interimTranscript : ''))
        : value;

    return (
        <div className="relative flex-1" style={{ minWidth: 0 }}>
            <div className={containerClasses}>
                {value && (
                    <button
                        onClick={onClear}
                        className={`absolute top-2 right-4 p-1.5 rounded-full transition-colors z-20 ${darkMode
                                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                        title="Clear text"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {!isOutput && !readOnly && !value && (
                    <button
                        onClick={handlePasteFromClipboard}
                        className={`absolute top-2 right-4 px-3 py-1.5 rounded-lg transition-colors z-20 flex items-center gap-2 ${darkMode
                                ? 'text-gray-500 hover:text-gray-100 hover:bg-gray-600'
                                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                            }`}
                        title="Paste from clipboard"
                    >
                        <Clipboard className="h-4 w-4" />
                        <span className="text-sm font-medium">Paste</span>
                    </button>
                )}

                <div className="relative">
                    <textarea
                        ref={textareaRef}
                        value={displayValue}
                        onChange={handleInput}
                        onPaste={handlePaste}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        className={textareaClasses}
                        style={{
                            height: isFixedSize ? '12rem' : undefined,
                            minHeight: isFixedSize ? undefined : '12rem',
                            overflowY: isFixedSize ? 'auto' : undefined,
                            paddingBottom: translations.length > 0 ? '3.5rem' : '1rem',
                            paddingRight: value ? '3rem' : '5rem',
                        }}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    />

                    {translations.length > 0 && (
                        <div className={`absolute bottom-0 left-0 right-0 h-12 border-t flex items-center justify-between px-4 ${darkMode
                                ? 'bg-gray-700 border-gray-700'
                                : 'bg-white'
                            }`}>
                            <button
                                onClick={onPrevious}
                                className={`p-1.5 rounded-full ${currentIndex > 0
                                        ? darkMode
                                            ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-600'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        : darkMode
                                            ? 'text-gray-600'
                                            : 'text-gray-300'
                                    }`}
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                                {currentIndex + 1}/{translations.length}
                            </div>

                            <button
                                onClick={onNext}
                                className={`p-1.5 rounded-full ${darkMode
                                        ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-8 mt-1 mb-4 relative flex items-center justify-between px-2">
                <div className="flex-shrink-0 flex items-center gap-2">
                    {!isOutput && !readOnly && (
                        <button
                            onClick={handleVoiceInput}
                            className={`${darkMode
                                    ? 'text-gray-400 hover:text-gray-200'
                                    : 'text-gray-500 hover:text-gray-700'
                                } ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                            title={isRecording ? "Stop recording" : "Voice input"}
                        >
                            <Mic className="h-5 w-5" />
                        </button>
                    )}
                    {shouldShowSpeaker && (
                        <button
                            onClick={handleSpeak}
                            className={`${darkMode
                                    ? 'text-gray-400 hover:text-gray-200'
                                    : 'text-gray-500 hover:text-gray-700'
                                } ${isSpeaking ? 'text-navy-500' : ''}`}
                            title={isSpeaking ? "Stop speaking" : "Text-to-speech"}
                        >
                            <Volume2 className={`h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                        </button>
                    )}
                    {showSpeaker && value && language === 'auto' && (
                        <span className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            TTS not available in auto-detect mode
                        </span>
                    )}
                </div>

                <div className={`flex-shrink-0 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {(value || '').length}{!isOutput && maxLength && `/${maxLength}`}
                </div>
            </div>

            <style jsx global>{`
                textarea::placeholder {
                    opacity: 0.5;
                }
            `}</style>
        </div>
    );
};

export default TextArea;
