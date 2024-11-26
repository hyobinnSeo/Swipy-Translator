import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Clipboard, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react';

// Default voice mapping for languages
const LANGUAGE_VOICE_MAPPING = {
    'en': 'en-US-AriaNeural',
    'ko': 'ko-KR-SunHiNeural',
    'ja': 'ja-JP-NanamiNeural',
    'zh': 'zh-CN-XiaoxiaoNeural',
    'fr': 'fr-FR-DeniseNeural',
    'es': 'es-ES-ElviraNeural',
    'de': 'de-DE-KatjaNeural',
    'it': 'it-IT-ElsaNeural',
    'pt': 'pt-BR-FranciscaNeural',
    'ar': 'ar-SA-ZariyahNeural'
};

const TextArea = ({
    value,
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
    const audioRef = useRef(new Audio());
    const [isSpeaking, setIsSpeaking] = useState(false);

    // Azure TTS configuration
    const subscriptionKey = process.env.REACT_APP_AZURE_TTS_KEY;
    const region = process.env.REACT_APP_AZURE_REGION;
    const baseUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

    const getAccessToken = useCallback(async () => {
        try {
            const response = await fetch(
                `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
                {
                    method: 'POST',
                    headers: {
                        'Ocp-Apim-Subscription-Key': subscriptionKey
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to get access token');
            return await response.text();
        } catch (error) {
            console.error('Error getting Azure access token:', error);
            throw error;
        }
    }, [region, subscriptionKey]);

    const escapeXMLText = useCallback((text) => {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }, []);

    const handleSpeak = useCallback(async () => {
        if (!value || !subscriptionKey || !region) return;

        if (isSpeaking) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsSpeaking(false);
            return;
        }

        try {
            const accessToken = await getAccessToken();
            const voice = selectedVoice || LANGUAGE_VOICE_MAPPING[language];
            const langCode = voice.split('-').slice(0, 2).join('-');

            const escapedText = escapeXMLText(value);

            const ssml = `
                <speak version='1.0' xml:lang='${langCode}'>
                    <voice name='${voice}'>
                        <prosody rate="0.9">
                            ${escapedText}
                        </prosody>
                    </voice>
                </speak>
            `;

            const response = await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/ssml+xml',
                    'X-Microsoft-OutputFormat': 'audio-24khz-160kbitrate-mono-mp3',
                    'User-Agent': 'HoochooTranslator'
                },
                body: ssml
            });

            if (!response.ok) {
                throw new Error(`TTS request failed: ${response.status} ${response.statusText}`);
            }

            const audioBlob = await response.blob();

            if (audioRef.current.src.startsWith('blob:')) {
                URL.revokeObjectURL(audioRef.current.src);
            }

            const audioUrl = URL.createObjectURL(audioBlob);

            audioRef.current.onended = () => {
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
            };

            audioRef.current.onerror = (e) => {
                console.error('Audio playback error:', e);
                setIsSpeaking(false);
                URL.revokeObjectURL(audioUrl);
            };

            audioRef.current.src = audioUrl;
            const playPromise = audioRef.current.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        setIsSpeaking(true);
                    })
                    .catch(error => {
                        console.error('Playback error:', error);
                        setIsSpeaking(false);
                        URL.revokeObjectURL(audioUrl);
                    });
            }
        } catch (error) {
            console.error('Azure TTS error:', error);
            setIsSpeaking(false);
        }
    }, [value, subscriptionKey, region, isSpeaking, baseUrl, language, selectedVoice, getAccessToken, escapeXMLText]);

    // Cleanup audio on unmount
    useEffect(() => {
        const currentAudioRef = audioRef.current;
        return () => {
            if (currentAudioRef) {
                currentAudioRef.pause();
                currentAudioRef.src = '';
            }
        };
    }, []);

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
        const availableSpace = maxLength - value.length + (e.target.selectionEnd - e.target.selectionStart);

        if (pastedText.length > availableSpace) {
            e.preventDefault();
            const newText = value.slice(0, e.target.selectionStart) +
                pastedText.slice(0, availableSpace) +
                value.slice(e.target.selectionEnd);
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

    const containerClasses = `relative rounded-lg border focus-within:ring-2 focus-within:ring-gray-600 focus-within:border-navy-600 transition-all overflow-hidden ${
        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white'
    }`;

    const textareaClasses = `w-full px-4 py-4 text-lg resize-none rounded-lg 
        focus:outline-none border-0 ${
            darkMode 
                ? 'bg-gray-700 text-gray-100 placeholder-gray-400' 
                : 'bg-white placeholder-gray-500'
        } ${readOnly ? darkMode ? 'bg-gray-800' : 'bg-gray-50' : ''} ${className}`;

    return (
        <div className="relative flex-1" style={{ minWidth: 0 }}>
            <div className={containerClasses}>
                {/* Clear button */}
                {value && (
                    <button
                        onClick={onClear}
                        className={`absolute top-2 right-4 p-1.5 rounded-full transition-colors z-20 ${
                            darkMode 
                                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' 
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                        title="Clear text"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {/* Paste button - only show if not output and no value */}
                {!isOutput && !readOnly && !value && (
                    <button
                        onClick={handlePasteFromClipboard}
                        className={`absolute top-2 right-4 px-3 py-1.5 rounded-lg transition-colors z-20 flex items-center gap-2 ${
                            darkMode 
                                ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-600' 
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
                        value={value}
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

                    {/* Translation navigation */}
                    {translations.length > 0 && (
                        <div className={`absolute bottom-0 left-0 right-0 h-12 border-t flex items-center justify-between px-4 ${
                            darkMode 
                                ? 'bg-gray-700 border-gray-600' 
                                : 'bg-white'
                        }`}>
                            <button
                                onClick={onPrevious}
                                className={`p-1.5 rounded-full ${
                                    currentIndex > 0 
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
                                className={`p-1.5 rounded-full ${
                                    darkMode
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

            {/* Bottom toolbar */}
            <div className="h-8 mt-1 mb-4 relative flex items-center justify-between px-2">
                <div className="flex-shrink-0">
                    {shouldShowSpeaker && (
                        <button
                            onClick={handleSpeak}
                            className={`${
                                darkMode
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
                    {value.length}{!isOutput && maxLength && `/${maxLength}`}
                </div>
            </div>
        </div>
    );
};

export default TextArea;
