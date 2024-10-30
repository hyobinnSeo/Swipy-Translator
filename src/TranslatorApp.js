import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    X,
    FileText,
    Clipboard,
    ClipboardCheck,
    ClipboardCopy,
    MenuIcon,
    Settings,
    Volume2,
    History,
    Trash2,
    BookmarkIcon,
    Search,
    Folder,
    Check,
    ChevronLeft,
    ChevronRight,
    ArrowLeftRight,
    ArrowRightLeft,
    AlertTriangle
} from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';



// Constants
const MODELS = {
    GEMINI: 'gemini',
    COMMAND: 'command'
};

const LANGUAGE_NAMES = {
    'auto': 'Auto Detect',
    'en': 'English',
    'fr': 'French / Français',
    'es': 'Spanish / Español',
    'it': 'Italian / Italiano',
    'de': 'German / Deutsch',
    'pt': 'Brazilian Portuguese / Português',
    'ja': 'Japanese / 日本語',
    'ko': 'Korean / 한국어',
    'zh': 'Simplified Chinese / 简体中文',
    'ar': 'Arabic / العربية'
};

const TONES = {
    [MODELS.GEMINI]: [
        {
            id: 'standard',
            name: '표준 / Standard',
            description: 'Regular translation'
        },
        {
            id: 'casual',
            name: '캐주얼 / Casual',
            description: 'Friendly and relaxed tone'
        },
        {
            id: 'formal',
            name: '격식체 / Formal',
            description: 'Professional and polite tone'
        },
        {
            id: 'humorous',
            name: '유머러스 / Humorous',
            description: 'Humorous and witty tone'
        },
        {
            id: 'business',
            name: '비즈니스 / Business',
            description: 'Business-oriented tone'
        },
        {
            id: 'kid_friendly',
            name: '어린이용 / Kid-Friendly',
            description: 'Simple and fun kid-friendly tone'
        },
        {
            id: 'literary',
            name: '문학 / Literary',
            description: 'Elegant literary style'
        }
    ],
    [MODELS.COMMAND]: [
        {
            id: 'standard',
            name: '표준 / Standard',
            description: 'Regular translation'
        },
        {
            id: 'casual',
            name: '캐주얼 / Casual',
            description: 'Friendly and relaxed tone'
        },
        {
            id: 'formal',
            name: '격식체 / Formal',
            description: 'Professional and polite tone'
        },
        {
            id: 'humorous',
            name: '유머러스 / Humorous',
            description: 'Humorous and witty tone'
        },
        {
            id: 'cardi_B',
            name: '카디비 / Cardi B',
            description: 'Raw and direct street tone'
        }
    ]
};

const DEFAULT_INSTRUCTIONS = {
    [MODELS.GEMINI]: {
        'pre-instruction': "You are a professional translator who specializes in providing accurate and natural translations. Your task is to create translations that convey the complete meaning, nuances, and cultural context of the source text while maintaining the linguistic features of the target language.",
        'post-instruction': "Note: Provide only the translated text. Do not include quotes, emojis, explanations or any additional comments.",
        'tone-instructions': {
            'standard': `Tone and Style:
- Maintain a neutral and clear tone
- Use standard language conventions
- Focus on accurate meaning transmission
- Keep formal and informal elements balanced
- Ensure natural flow in the target language`,
            'casual': `Tone and Style:
- Use everyday conversational language
- Incorporate common colloquialisms when appropriate
- Keep the tone friendly and approachable
- Use contractions where natural
- Maintain an informal yet respectful tone
- Adapt idioms to target language equivalents`,
            'formal': `Tone and Style:
- Use formal language throughout
- Maintain professional terminology
- Avoid contractions and colloquialisms
- Use proper honorifics where applicable
- Keep a respectful and courteous tone
- Prioritize precise and elegant expression`,
            'humorous': `Tone and Style:
- Use witty and clever expressions
- Incorporate appropriate humor and wordplay
- Keep the tone engaging and entertaining
- Use creative language choices
- Maintain cultural sensitivity while being playful
- Adapt jokes and puns to target language context`,
            'business': `Tone and Style:
- Use professional business language
- Incorporate industry-standard terminology
- Maintain clear and concise expression
- Use appropriate business formalities
- Keep a professional yet accessible tone
- Focus on clarity and efficiency in communication`,
            'kid_friendly': `Tone and Style: Kid-Friendly
- Use simple, friendly words
- Make sure everything is easy to understand
- Keep the tone encouraging and playful`,
            'literary': `Tone and Style:
- Use sophisticated vocabulary and phrasing
- Maintain artistic and creative expression
- Preserve metaphors and literary devices
- Focus on aesthetic quality
- Keep the elegant and refined style
- Adapt cultural references appropriately`
        }
    },
    [MODELS.COMMAND]: {
        'pre-instruction': "You are a professional translator who specializes in providing accurate and natural translations. Your task is to create translations that convey the complete meaning, nuances, and cultural context of the source text while maintaining the linguistic features of the target language.",
        'post-instruction': "Note: Provide only the translated text. Do not include quotes, emojis, explanations or any additional comments.",
        'tone-instructions': {
            'standard': `Tone and Style:
- Maintain a neutral and clear tone
- Use standard language conventions
- Focus on accurate meaning transmission
- Keep formal and informal elements balanced
- Ensure natural flow in the target language`,
            'casual': `Tone and Style:
- Use everyday conversational language
- Incorporate common colloquialisms when appropriate
- Keep the tone friendly and approachable
- Use contractions where natural
- Maintain an informal yet respectful tone
- Adapt idioms to target language equivalents`,
            'formal': `Tone and Style:
- Use formal language throughout
- Maintain professional terminology
- Avoid contractions and colloquialisms
- Use proper honorifics where applicable
- Keep a respectful and courteous tone
- Prioritize precise and elegant expression`,
            'humorous': `Tone and Style:
- Use witty and clever expressions
- Incorporate appropriate humor and wordplay
- Keep the tone engaging and entertaining
- Use creative language choices
- Maintain cultural sensitivity while being playful
- Adapt jokes and puns to target language context`,
            'cardi_B': `Tone and Style:
- Be bold and unapologetic in delivery
- Keep it real and unfiltered AF
- Incorporate current street slang and vernacular
- Drop formality completely
- Focus on authenticity over politeness
- Use deliberate grammar/spelling variations for effect
- Adapt street idioms appropriately
- Mix casual profanity for emphasis`
        }
    }
};

const LANGUAGE_VOICE_MAPPING = {
    'en': 'en-US-JennyNeural',
    'ko': 'ko-KR-SunHiNeural',
    'ja': 'ja-JP-NanamiNeural',
    'zh': 'zh-CN-XiaoxiaoNeural',
    'ar': 'ar-SA-ZariyahNeural',
    'fr': 'fr-FR-DeniseNeural',
    'es': 'es-ES-ElviraNeural',
    'it': 'it-IT-ElsaNeural',
    'de': 'de-DE-KatjaNeural',
    'pt': 'pt-BR-FranciscaNeural'
};

// Add these constants at the top of TranslatorApp.js, after the imports
const VOICE_OPTIONS = {
    'en': [
        { id: 'en-US-AriaNeural', name: 'Aria (Female)' },
        { id: 'en-US-GuyNeural', name: 'Guy (Male)' },
        { id: 'en-US-JennyNeural', name: 'Jenny (Female)' },
        { id: 'en-US-DavisNeural', name: 'Davis (Male)' }
    ],
    'ko': [
        { id: 'ko-KR-SunHiNeural', name: '선희 (여성)' },
        { id: 'ko-KR-InJoonNeural', name: '인준 (남성)' },
        { id: 'ko-KR-JiMinNeural', name: '지민 (여성)' },
        { id: 'ko-KR-BongJinNeural', name: '봉진 (남성)' }
    ],
    'ja': [
        { id: 'ja-JP-NanamiNeural', name: '七海 (女性)' },
        { id: 'ja-JP-KeitaNeural', name: '圭太 (男性)' },
        { id: 'ja-JP-AoiNeural', name: '葵 (女性)' },
        { id: 'ja-JP-DaichiNeural', name: '大智 (男性)' }
    ],
    'zh': [
        { id: 'zh-CN-XiaoxiaoNeural', name: '晓晓 (女性)' },
        { id: 'zh-CN-YunxiNeural', name: '云希 (男性)' },
        { id: 'zh-CN-XiaoyiNeural', name: '晓伊 (女性)' },
        { id: 'zh-CN-YunjianNeural', name: '云剑 (男性)' }
    ],
    'fr': [
        { id: 'fr-FR-DeniseNeural', name: 'Denise (Femme)' },
        { id: 'fr-FR-HenriNeural', name: 'Henri (Homme)' }
    ],
    'es': [
        { id: 'es-ES-ElviraNeural', name: 'Elvira (Mujer)' },
        { id: 'es-ES-AlvaroNeural', name: 'Alvaro (Hombre)' }
    ],
    'de': [
        { id: 'de-DE-KatjaNeural', name: 'Katja (Weiblich)' },
        { id: 'de-DE-ConradNeural', name: 'Conrad (Männlich)' }
    ],
    'it': [
        { id: 'it-IT-ElsaNeural', name: 'Elsa (Donna)' },
        { id: 'it-IT-DiegoNeural', name: 'Diego (Uomo)' }
    ],
    'pt': [
        { id: 'pt-BR-FranciscaNeural', name: 'Francisca (Feminino)' },
        { id: 'pt-BR-AntonioNeural', name: 'Antonio (Masculino)' }
    ],
    'ar': [
        { id: 'ar-SA-ZariyahNeural', name: 'زارية (أنثى)' },
        { id: 'ar-SA-HamedNeural', name: 'حامد (ذكر)' }
    ]
};

const getToneInstructions = (tone, modelInstructions, selectedModel) => {
    const toneInstructions = modelInstructions[selectedModel]['tone-instructions'];
    return {
        instruction: toneInstructions[tone] || toneInstructions['standard']
    };
};

const AVAILABLE_MODELS = [
    { id: MODELS.GEMINI, name: 'Gemini 1.5', api: 'google' },
    { id: MODELS.COMMAND, name: 'Cohere Command R', api: 'openrouter' }
];

const MAX_HISTORY_ITEMS = 10;

const loadHistory = () => {
    try {
        return JSON.parse(localStorage.getItem('translationHistory')) || [];
    } catch {
        return [];
    }
};

const saveHistory = (history) => {
    localStorage.setItem('translationHistory', JSON.stringify(history));
};

const MAX_SAVED_TRANSLATIONS = 50;

const loadSavedTranslations = () => {
    try {
        return JSON.parse(localStorage.getItem('savedTranslations')) || [];
    } catch {
        return [];
    }
};

const saveSavedTranslations = (translations) => {
    localStorage.setItem('savedTranslations', JSON.stringify(translations));
};

// Components
const Alert = ({ children }) => (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{children}</span>
    </div>
);

// Add LanguageSelector component definition here
const LanguageSelector = ({
    sourceLang,
    targetLang,
    onSourceChange,
    onTargetChange,
    inputText,
    translatedText,
    onInputTextChange,
    onTranslatedTextChange,
    onResetTranslations
}) => {
    const languages = [
        { code: 'auto', name: 'Auto Detect' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French / Français' },
        { code: 'es', name: 'Spanish / Español' },
        { code: 'it', name: 'Italian / Italiano' },
        { code: 'de', name: 'German / Deutsch' },
        { code: 'pt', name: 'Brazilian Portuguese / Português' },
        { code: 'ja', name: 'Japanese / 日本語' },
        { code: 'ko', name: 'Korean / 한국어' },
        { code: 'zh', name: 'Simplified Chinese / 简体中文' },
        { code: 'ar', name: 'Arabic / العربية' }
    ];

    const switchLanguages = () => {
        // Basic language swap
        onSourceChange(targetLang);
        onTargetChange(sourceLang);

        // Swap text content
        onInputTextChange(translatedText);
        onTranslatedTextChange(inputText);

        // Reset translations
        onResetTranslations();
    };

    const isAutoDetect = sourceLang === 'auto';

    return (
        <div className="flex items-center justify-between gap-2 mt-4 mb-2">
            <div className="flex-1">
                <select
                    value={sourceLang}
                    onChange={(e) => onSourceChange(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    dir={sourceLang === 'ar' ? 'rtl' : 'ltr'}
                >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={switchLanguages}
                disabled={isAutoDetect}
                className={`p-2 rounded-full ${isAutoDetect
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'hover:bg-gray-100 text-gray-600'
                    }`}
                title={isAutoDetect ? "Language swap disabled during auto-detection" : "Switch languages"}
            >
                <ArrowLeftRight className="w-5 h-5" />
            </button>

            <div className="flex-1">
                <select
                    value={targetLang}
                    onChange={(e) => onTargetChange(e.target.value)}
                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                    dir={targetLang === 'ar' ? 'rtl' : 'ltr'}
                >
                    {languages.filter(lang => lang.code !== 'auto').map(lang => (
                        <option key={lang.code} value={lang.code}>
                            {lang.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

const ToneSelector = ({ selectedTone, onToneChange, selectedModel }) => {
    const [showToneSelector, setShowToneSelector] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowToneSelector(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get the tone list for the selected model
    const modelTones = TONES[selectedModel] || TONES[MODELS.GEMINI];

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setShowToneSelector(!showToneSelector)}
                className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:text-gray-800 
                   hover:bg-gray-50 rounded-lg transition-colors"
            >
                <Settings className="w-4 h-4" />
                <span>Tone: {modelTones.find(t => t.id === selectedTone)?.name}</span>
            </button>

            {showToneSelector && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50">
                    {modelTones.map((tone) => (
                        <button
                            key={tone.id}
                            onClick={() => {
                                onToneChange(tone.id);
                                setShowToneSelector(false);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${selectedTone === tone.id ? 'bg-gray-50' : ''
                                }`}
                        >
                            <div className="font-medium">{tone.name}</div>
                            <div className="text-sm text-gray-500">{tone.description}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const saveVoiceSettings = (settings) => {
    localStorage.setItem('voiceSettings', JSON.stringify(settings));
};

const VoiceSettingsModal = ({ isOpen, onClose, selectedVoices, onVoiceChange }) => {
    const [localVoices, setLocalVoices] = useState(selectedVoices);

    // Reset to defaults
    const handleReset = () => {
        const defaultVoices = {
            'en': 'en-US-JennyNeural',
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
        setLocalVoices(defaultVoices);
    };

    // Save changes
    const handleSave = () => {
        onVoiceChange(localVoices);
        onClose();
    };

    return (
        <DialogWrapper isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex-shrink-0 p-6 border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold">Voice Settings</h2>
                        <p className="text-sm text-gray-500 mt-1">Select preferred voices for each language</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    {Object.entries(VOICE_OPTIONS).map(([lang, voices]) => (
                        <div key={lang} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {LANGUAGE_NAMES[lang]}:
                            </label>
                            <select
                                value={localVoices[lang] || ''}
                                onChange={(e) => setLocalVoices(prev => ({
                                    ...prev,
                                    [lang]: e.target.value
                                }))}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {voices.map((voice) => (
                                    <option key={voice.id} value={voice.id}>
                                        {voice.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-shrink-0 p-6 border-t bg-white">
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-blue-500 hover:text-blue-600"
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Done
                    </button>
                </div>
            </div>
        </DialogWrapper>
    );
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
    selectedVoice
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
    }, [region, subscriptionKey]); // Added missing dependencies

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
        const currentAudioRef = audioRef.current; // Store ref value

        return () => {
            if (currentAudioRef) {
                currentAudioRef.pause();
                currentAudioRef.src = '';
            }
        };
    }, []);

    // Height adjustment logic
    const adjustHeight = useCallback(() => {
        if (!textareaRef.current) return;

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
    }, []);

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

    return (
        <div className="relative flex-1" style={{ minWidth: 0 }}>
            <div className="relative rounded-lg border focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all bg-white overflow-hidden">
                {/* Clear button */}
                {value && (
                    <button
                        onClick={onClear}
                        className="absolute top-2 right-4 p-1.5 text-gray-400 hover:text-gray-600 
                        hover:bg-gray-100 rounded-full transition-colors z-20"
                        title="Clear text"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {/* Paste button - only show if not output and no value */}
                {!isOutput && !readOnly && !value && (
                    <button
                        onClick={handlePasteFromClipboard}
                        className="absolute top-2 right-4 px-3 py-1.5 text-gray-600 hover:text-gray-800 
                        hover:bg-gray-100 rounded-lg transition-colors z-20 flex items-center gap-2"
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
                        className={`w-full px-4 py-4 text-lg resize-none rounded-lg 
                        focus:outline-none border-0 bg-white
                        ${readOnly ? 'bg-gray-50' : ''} ${className}`}
                        style={{
                            minHeight: '12rem',
                            paddingBottom: translations.length > 0 ? '3.5rem' : '1rem',
                            paddingRight: value ? '3rem' : '5rem',
                        }}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    />

                    {/* Translation navigation */}
                    {translations.length > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white border-t flex items-center justify-between px-4">
                            <button
                                onClick={onPrevious}
                                className={`p-1.5 rounded-full hover:bg-gray-100 
                                    ${currentIndex > 0 ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300'}`}
                                disabled={currentIndex === 0}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>

                            <div className="text-sm text-gray-500">
                                {currentIndex + 1}/{translations.length}
                            </div>

                            <button
                                onClick={onNext}
                                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
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
                            className={`text-gray-500 hover:text-gray-700 ${isSpeaking ? 'text-blue-500' : ''}`}
                            title={isSpeaking ? "Stop speaking" : "Text-to-speech"}
                        >
                            <Volume2 className={`h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                        </button>
                    )}
                    {showSpeaker && value && language === 'auto' && (
                        <span className="text-sm text-gray-400 italic">
                            TTS not available in auto-detect mode
                        </span>
                    )}
                </div>

                <div className="flex-shrink-0 text-sm text-gray-500">
                    {value.length}{!isOutput && maxLength && `/${maxLength}`}
                </div>
            </div>
        </div>
    );
};

// Reusable Dialog Wrapper Component
const DialogWrapper = ({ isOpen, onClose, children, className = '' }) => {
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className={`bg-white rounded-lg ${className}`}
                onClick={e => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
};

const InstructionsModal = ({ isOpen, onClose, modelInstructions, selectedModel, setModelInstructions, selectedTone }) => {
    // Find the current model name from AVAILABLE_MODELS
    const currentModel = AVAILABLE_MODELS.find(model => model.id === selectedModel)?.name || selectedModel;

    // Get the tone list for the selected model
    const modelTones = TONES[selectedModel] || TONES[MODELS.GEMINI];

    const handleReset = () => {
        setModelInstructions({
            ...modelInstructions,
            [selectedModel]: DEFAULT_INSTRUCTIONS[selectedModel]
        });
    };

    return (
        <DialogWrapper isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex-shrink-0 p-6 border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold">Instructions Settings</h2>
                        <p className="text-sm text-gray-500 mt-1">Current Model: {currentModel}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pre-translation Instructions:
                        </label>
                        <textarea
                            value={modelInstructions[selectedModel]['pre-instruction']}
                            onChange={(e) => setModelInstructions({
                                ...modelInstructions,
                                [selectedModel]: {
                                    ...modelInstructions[selectedModel],
                                    'pre-instruction': e.target.value
                                }
                            })}
                            className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Post-translation Instructions:
                        </label>
                        <textarea
                            value={modelInstructions[selectedModel]['post-instruction']}
                            onChange={(e) => setModelInstructions({
                                ...modelInstructions,
                                [selectedModel]: {
                                    ...modelInstructions[selectedModel],
                                    'post-instruction': e.target.value
                                }
                            })}
                            className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tone Instructions for {modelTones.find(t => t.id === selectedTone)?.name}:
                        </label>
                        <textarea
                            value={modelInstructions[selectedModel]['tone-instructions'][selectedTone]}
                            onChange={(e) => setModelInstructions({
                                ...modelInstructions,
                                [selectedModel]: {
                                    ...modelInstructions[selectedModel],
                                    'tone-instructions': {
                                        ...modelInstructions[selectedModel]['tone-instructions'],
                                        [selectedTone]: e.target.value
                                    }
                                }
                            })}
                            className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-shrink-0 p-6 border-t bg-white">
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-blue-500 hover:text-blue-600"
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Done
                    </button>
                </div>
            </div>
        </DialogWrapper>
    );
};

const RequestLogViewer = ({ isOpen, onClose, requestLog }) => {
    return (
        <DialogWrapper isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Last API Request</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {requestLog ? (
                    <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm font-mono">
                        {JSON.stringify(requestLog, null, 2)}
                    </pre>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No request log available</p>
                    </div>
                )}
            </div>
        </DialogWrapper>
    );
};

const Sidebar = ({
    isOpen,
    onClose,
    onOpenInstructions,
    onOpenSaved,
    onOpenRequestLog,
    onOpenHistory,
    onOpenVoiceSettings  // Add this prop
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-20 
                ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <div
                className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform 
                transition-transform duration-300 ease-in-out z-30 flex flex-col overflow-hidden
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Menu</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                    <div className="space-y-2">
                        <button
                            onClick={() => {
                                onOpenHistory();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                        >
                            <History className="h-4 w-4 mr-2" />
                            Translation History
                        </button>

                        <button
                            onClick={() => {
                                onOpenSaved();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                        >
                            <BookmarkIcon className="h-4 w-4 mr-2" />
                            Saved Translations
                        </button>

                        <button
                            onClick={() => {
                                onOpenVoiceSettings();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                        >
                            <Volume2 className="h-4 w-4 mr-2" />
                            Voice Settings
                        </button>

                        <button
                            onClick={() => {
                                onOpenInstructions();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Instructions
                        </button>

                        <button
                            onClick={() => {
                                onOpenRequestLog();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Last API Request
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const SavedTranslationsDialog = ({ isOpen, onClose, savedTranslations, onSelectSaved, onDeleteSaved, onClearAll }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Reset search when dialog is opened
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setSearchTerm('');
        setShowConfirmDialog(false);
        setItemToDelete(null);
        onClose();
    };

    const filteredTranslations = savedTranslations.filter(item =>
        item.inputText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.translatedText.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Saved Translations</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search translations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {savedTranslations.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <Folder className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                            <p>No saved translations yet</p>
                        </div>
                    ) : filteredTranslations.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p>No translations match your search</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTranslations.map((item, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors group relative"
                                >
                                    <div className="mb-2 flex justify-between items-start">
                                        <span className="text-sm text-gray-500">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setItemToDelete(index);
                                                setShowConfirmDialog(true);
                                            }}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="text-xs font-medium text-gray-500 mb-1">Original:</div>
                                            <div className="text-sm">{item.inputText}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-gray-500 mb-1">Translation:</div>
                                            <div className="text-sm">{item.translatedText}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => {
                                                onSelectSaved(item);
                                                onClose();
                                            }}
                                            className="text-sm text-blue-500 hover:text-blue-600"
                                        >
                                            Load translation
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {savedTranslations.length > 0 && (
                    <div className="p-4 border-t">
                        <button
                            onClick={() => setShowConfirmDialog(true)}
                            className="text-red-500 hover:text-red-600 text-sm"
                        >
                            Clear all saved translations
                        </button>
                    </div>
                )}
            </div>

            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-2">
                            {itemToDelete !== null ? "Delete Translation" : "Clear All Translations"}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {itemToDelete !== null
                                ? "Are you sure you want to delete this translation?"
                                : "Are you sure you want to clear all saved translations? This action cannot be undone."}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowConfirmDialog(false);
                                    setItemToDelete(null);
                                }}
                                className="px-4 py-2 text-gray-500 hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (itemToDelete !== null) {
                                        onDeleteSaved(itemToDelete);
                                    } else {
                                        onClearAll();
                                    }
                                    setShowConfirmDialog(false);
                                    setItemToDelete(null);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const HistoryPanel = ({ isOpen, onClose, history, onSelectHistory, onDeleteHistory, onClearHistory }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-20 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div
                className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform 
          transition-transform z-30 ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Translation History</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                    <div className="space-y-4">
                        {history.length > 0 && (
                            <button
                                onClick={() => setShowConfirmDialog(true)}
                                className="w-full px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors mb-4"
                            >
                                Clear All History
                            </button>
                        )}

                        {history.map((item, index) => (
                            <div
                                key={index}
                                className="p-3 border rounded-lg hover:bg-gray-50 relative group"
                            >
                                <div
                                    className="cursor-pointer"
                                    onClick={() => onSelectHistory(item)}
                                >
                                    <div className="text-sm font-medium text-gray-600 mb-1">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate pr-8">
                                        {item.inputText}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setItemToDelete(index);
                                        setShowConfirmDialog(true);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 
                                    hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete entry"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        {history.length === 0 && (
                            <div className="text-center text-gray-500 py-4">
                                No translation history yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => {
                    setShowConfirmDialog(false);
                    setItemToDelete(null);
                }}
                onConfirm={() => {
                    if (itemToDelete !== null) {
                        onDeleteHistory(itemToDelete);
                    } else {
                        onClearHistory();
                    }
                }}
                title={itemToDelete !== null ? "Delete Entry" : "Clear Translation History"}
                message={
                    itemToDelete !== null
                        ? "Are you sure you want to delete this translation entry?"
                        : "Are you sure you want to clear all translation history? This action cannot be undone."
                }
            />
        </>
    );
};

const SafetyWarningDialog = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
                    aria-label="Close dialog"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-yellow-50 rounded-full p-2">
                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Content Warning
                        </h3>

                        <p className="text-gray-600 mb-4">
                            The translation request was blocked due to potentially inappropriate content. Please review your text and try again with appropriate content.
                        </p>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <div className="font-medium text-yellow-800 mb-1">Note</div>
                            <div className="text-yellow-700 text-sm">
                                Our translation service maintains certain content standards to ensure safe and respectful communication.
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TranslatorApp = () => {
    const [inputText, setInputText] = useState('');
    const [translations, setTranslations] = useState([]); // Array of translations
    const [currentIndex, setCurrentIndex] = useState(0);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState(MODELS.GEMINI);
    const [modelInstructions, setModelInstructions] = useState(DEFAULT_INSTRUCTIONS);
    const [history, setHistory] = useState([]);
    const [savedTranslations, setSavedTranslations] = useState([]);
    const [isSavedOpen, setIsSavedOpen] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [requestLog, setRequestLog] = useState(null);
    const [isRequestLogOpen, setIsRequestLogOpen] = useState(false);
    const [sourceLang, setSourceLang] = useState('auto');
    const [targetLang, setTargetLang] = useState('en');
    const [showSafetyWarning, setShowSafetyWarning] = useState(false);
    const [selectedTone, setSelectedTone] = useState('standard');
    const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);
    const [selectedVoices, setSelectedVoices] = useState({
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
    });

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        // Reset tone to standard when changing models if current tone isn't available
        const modelTones = TONES[selectedModel] || TONES[MODELS.GEMINI];
        if (!modelTones.find(tone => tone.id === selectedTone)) {
            setSelectedTone('standard');
        }
    }, [selectedModel]);
    /* eslint-enable react-hooks/exhaustive-deps */

    useEffect(() => {
        setHistory(loadHistory());
        setSavedTranslations(loadSavedTranslations());
    }, []);

    const translateWithGemini = async (text, previousTranslations = []) => {
        try {
            const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            // Get base instructions
            const basePreInstruction = modelInstructions[selectedModel]['pre-instruction'];
            const postInstruction = modelInstructions[selectedModel]['post-instruction'];

            // Get language settings
            const sourceLanguage = LANGUAGE_NAMES[sourceLang] || sourceLang;
            const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang;
            const toneInstructions = getToneInstructions(selectedTone, modelInstructions, selectedModel);

            // Construct the prompt
            let prompt = `Instructions:\n${basePreInstruction}\n\n`;

            // Add Language settings
            prompt += `Language:\n`;
            if (sourceLang === 'auto') {
                prompt += `- Detect source language and translate to ${targetLanguage}\n\n`;
            } else {
                prompt += `- From: ${sourceLanguage}\n- To: ${targetLanguage}\n\n`;
            }

            // Add Tone settings
            prompt += `Tone:\n${toneInstructions.instruction}\n\n`;

            // Add text to translate
            prompt += `Text to be translated:\n${text}\n\n`;

            // Add previous translations if any
            if (previousTranslations.length > 0) {
                prompt += "Previous translations to avoid repeating:\n";
                previousTranslations.forEach((trans, index) => {
                    prompt += `${index + 1}: ${trans.text}\n`;
                });
                prompt += "\nNote: Provide a fresh translation different from the above versions.\n\n";
            }

            // Add post instructions
            prompt += postInstruction;

            // Set request log
            const requestBody = {
                model: "gemini-1.5-flash",
                messages: [{ content: prompt }],
                endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash",
                headers: {
                    'Content-Type': 'application/json'
                },
            };
            setRequestLog(requestBody);

            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            throw new Error(error.message.includes('API key')
                ? 'Invalid Gemini API key. Please check your environment variables.'
                : `Translation error: ${error.message}`);
        }
    };

    const translateWithOpenRouter = async (text, modelId, previousTranslations = []) => {
        const modelUrl = 'cohere/command-r-08-2024';

        // Get base instructions
        const basePreInstruction = modelInstructions[selectedModel]['pre-instruction'];
        const postInstruction = modelInstructions[selectedModel]['post-instruction'];
        const toneInstructions = getToneInstructions(selectedTone, modelInstructions, selectedModel);

        // Get language settings
        const sourceLanguage = LANGUAGE_NAMES[sourceLang] || sourceLang;
        const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang;

        // Construct the prompt for system message
        let prompt = `Instructions:\n${basePreInstruction}\n\n`;

        // Add Language settings
        prompt += `Language:\n`;
        if (sourceLang === 'auto') {
            prompt += `- Detect source language and translate to ${targetLanguage}\n\n`;
        } else {
            prompt += `- From: ${sourceLanguage}\n- To: ${targetLanguage}\n\n`;
        }

        // Add Tone settings
        prompt += `Tone:\n${toneInstructions.instruction}\n\n`;

        // Create user message with the text to translate
        prompt += `Text to be translated:\n${text}\n\n`;

        // Add previous translations if any
        if (previousTranslations.length > 0) {
            prompt += "Previous translations to avoid repeating:\n";
            previousTranslations.forEach((trans, index) => {
                prompt += `${index + 1}: ${trans.text}\n`;
            });
            prompt += "\nNote: Provide a fresh translation different from the above versions.\n\n";
        }

        const requestBody = {
            model: modelUrl,
            messages: [
                { role: "system", content: prompt },
                { role: "system", content: postInstruction }
            ],
            endpoint: "https://openrouter.ai/api/v1/chat/completions",
            headers: {
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Translator App'
            },
        };
        setRequestLog(requestBody);

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'Translator App'
                },
                body: JSON.stringify({
                    model: modelUrl,
                    messages: [
                        { role: "system", content: prompt },
                        { role: "system", content: postInstruction }
                    ]
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.choices[0]?.message?.content;
        } catch (error) {
            throw new Error(error.message === 'Unauthorized'
                ? 'Invalid API key. Please check your environment variables.'
                : `Translation error: ${error.message}`);
        }
    };

    const validateLanguageSupport = (sourceLang, targetLang) => {
        const supportedLanguages = ['auto', 'en', 'fr', 'es', 'it', 'de', 'pt', 'ja', 'ko', 'zh', 'ar'];

        if (sourceLang !== 'auto' && !supportedLanguages.includes(sourceLang)) {
            throw new Error(`Unsupported source language: ${sourceLang}`);
        }

        if (!supportedLanguages.includes(targetLang)) {
            throw new Error(`Unsupported target language: ${targetLang}`);
        }
    }

    const deleteHistoryItem = (index) => {
        const newHistory = [...history];
        newHistory.splice(index, 1);
        setHistory(newHistory);
        saveHistory(newHistory);
    };

    const clearAllHistory = () => {
        setHistory([]);
        saveHistory([]);
    };

    const handleSaveTranslation = () => {
        if (!inputText || !translatedText) return;

        const newSavedTranslation = {
            inputText,
            translatedText,
            model: selectedModel,
            timestamp: new Date().toISOString()
        };

        const updatedSavedTranslations = [
            newSavedTranslation,
            ...savedTranslations
        ].slice(0, MAX_SAVED_TRANSLATIONS);

        setSavedTranslations(updatedSavedTranslations);
        saveSavedTranslations(updatedSavedTranslations);

        // Show success feedback
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    const deleteSavedTranslation = (index) => {
        const newSavedTranslations = [...savedTranslations];
        newSavedTranslations.splice(index, 1);
        setSavedTranslations(newSavedTranslations);
        saveSavedTranslations(newSavedTranslations);
    };

    const clearAllSavedTranslations = () => {
        setSavedTranslations([]);
        saveSavedTranslations([]);
    };

    // Get current translation text
    const translatedText = translations[currentIndex]?.text || '';

    // Handle translation navigation
    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleNext = async () => {
        if (currentIndex < translations.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Request new translation when at the end
            await handleTranslate(true);
        }
    };

    const handleTranslate = async (isAdditional = false) => {
        try {
            setIsLoading(true);
            setError('');
            validateLanguageSupport(sourceLang, targetLang);

            let translatedResult;
            if (isAdditional) {
                if (selectedModel === MODELS.GEMINI) {
                    translatedResult = await translateWithGemini(inputText, translations);
                } else {
                    translatedResult = await translateWithOpenRouter(inputText, selectedModel, translations);
                }
            } else {
                if (selectedModel === MODELS.GEMINI) {
                    translatedResult = await translateWithGemini(inputText);
                } else {
                    translatedResult = await translateWithOpenRouter(inputText, selectedModel);
                }
            }

            if (!translatedResult) throw new Error('No translation result.');

            if (isAdditional) {
                // Add new translation to the array
                setTranslations(prev => [...prev, { text: translatedResult, timestamp: new Date() }]);
                setCurrentIndex(translations.length);
            } else {
                // Reset translations with new first translation
                setTranslations([{ text: translatedResult, timestamp: new Date() }]);
                setCurrentIndex(0);
            }

            // Add to history
            const newHistory = [
                {
                    inputText,
                    translatedText: translatedResult,
                    model: selectedModel,
                    timestamp: new Date().toISOString()
                },
                ...history
            ].slice(0, MAX_HISTORY_ITEMS);

            setHistory(newHistory);
            saveHistory(newHistory);
        } catch (err) {
            if (err.message.includes('SAFETY')) {
                setShowSafetyWarning(true);
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
            setCopySuccess(false);
        }
    };

    const handleVoiceChange = (newVoices) => {
        setSelectedVoices(newVoices);
        saveVoiceSettings(newVoices);
    };

    // Handle touch events for swipe
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        }
        if (isRightSwipe) {
            handlePrevious();
        }
    };

    // Handle clear
    const handleClear = () => {
        setInputText('');
        setTranslations([]);
        setCurrentIndex(0);
        setCopySuccess(false);
        setError('');
    };

    const baseUrl = process.env.PUBLIC_URL || '/';

    return (
        <div className="w-full min-h-screen bg-gray-50">
            {/* Modals and Dialogs */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onOpenInstructions={() => setIsInstructionsOpen(true)}
                onOpenSaved={() => setIsSavedOpen(true)}
                onOpenRequestLog={() => setIsRequestLogOpen(true)}
                onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
            />

            <HistoryPanel
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                history={history}
                onSelectHistory={(item) => {
                    setInputText(item.inputText);
                    setTranslations([{ text: item.translatedText, timestamp: new Date() }]);
                    setCurrentIndex(0);
                    setIsHistoryOpen(false);
                }}
                onDeleteHistory={deleteHistoryItem}
                onClearHistory={clearAllHistory}
            />

            <SavedTranslationsDialog
                isOpen={isSavedOpen}
                onClose={() => setIsSavedOpen(false)}
                savedTranslations={savedTranslations}
                onSelectSaved={(item) => {
                    setInputText(item.inputText);
                    setTranslations([{ text: item.translatedText, timestamp: new Date() }]);
                    setCurrentIndex(0);
                }}
                onDeleteSaved={deleteSavedTranslation}
                onClearAll={clearAllSavedTranslations}
            />

            <InstructionsModal
                isOpen={isInstructionsOpen}
                onClose={() => setIsInstructionsOpen(false)}
                modelInstructions={modelInstructions}
                selectedModel={selectedModel}
                setModelInstructions={setModelInstructions}
                selectedTone={selectedTone}
            />

            <VoiceSettingsModal
                isOpen={isVoiceSettingsOpen}
                onClose={() => setIsVoiceSettingsOpen(false)}
                selectedVoices={selectedVoices}
                onVoiceChange={handleVoiceChange}
            />

            <RequestLogViewer
                isOpen={isRequestLogOpen}
                onClose={() => setIsRequestLogOpen(false)}
                requestLog={requestLog}
            />

            <SafetyWarningDialog
                isOpen={showSafetyWarning}
                onClose={() => setShowSafetyWarning(false)}
            />

            {/* Header */}
            <div className="w-full border-b bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center p-4 space-x-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-gray-600 hover:text-gray-800 transition-colors"
                            title="Menu"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>

                        <a
                            href={baseUrl}
                            className="text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            Hoochoo Translator
                        </a>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto p-4">
                <div className="space-y-1">
                    {/* Model selector */}
                    <div className="w-full">
                        <select
                            value={selectedModel}
                            onChange={(e) => {
                                setSelectedModel(e.target.value);
                                setTranslations([]);
                                setCurrentIndex(0);
                            }}
                            className="w-[200px] p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            {AVAILABLE_MODELS.map((model) => (
                                <option key={model.id} value={model.id}>
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Language selector */}
                    <div className="mt-2"> {/* Added wrapper with smaller margin */}
                        <LanguageSelector
                            sourceLang={sourceLang}
                            targetLang={targetLang}
                            onSourceChange={setSourceLang}
                            onTargetChange={setTargetLang}
                            inputText={inputText}
                            translatedText={translatedText}
                            onInputTextChange={setInputText}
                            onTranslatedTextChange={(text) => {
                                setTranslations([{ text, timestamp: new Date() }]);
                                setCurrentIndex(0);
                            }}
                            onResetTranslations={() => {
                                setTranslations([]);
                                setCurrentIndex(0);
                            }}
                        />
                    </div>

                    {/* Tone selector */}
                    <div className="mt-2 mb-2"> {/* Added wrapper with smaller margins */}
                        <ToneSelector
                            selectedTone={selectedTone}
                            onToneChange={setSelectedTone}
                            selectedModel={selectedModel}
                        />
                    </div>

                    {/* Text areas */}
                    <div className="flex flex-col md:flex-row gap-2 md:gap-6 mb-6">
                        {/* Input TextArea */}
                        <TextArea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter text..."
                            showSpeaker={true}
                            maxLength={5000}
                            onClear={() => handleClear()}
                            language={sourceLang}
                            selectedVoice={selectedVoices[sourceLang]}
                        />

                        {/* Output TextArea */}
                        <TextArea
                            value={translatedText}
                            isOutput={true}
                            onChange={(e) => {
                                const newText = e.target.value;
                                const updatedTranslations = translations.map((item, index) =>
                                    index === currentIndex
                                        ? { ...item, text: newText }
                                        : item
                                );
                                setTranslations(updatedTranslations);
                            }}
                            placeholder="Translation will appear here..."
                            showSpeaker={true}
                            onTouchStart={onTouchStart}
                            onTouchMove={onTouchMove}
                            onTouchEnd={onTouchEnd}
                            translations={translations}
                            currentIndex={currentIndex}
                            onPrevious={handlePrevious}
                            onNext={handleNext}
                            onClear={() => {
                                setTranslations([]);
                                setCurrentIndex(0);
                            }}
                            language={targetLang}
                            selectedVoice={selectedVoices[targetLang]}
                        />
                    </div>

                    {/* Error message */}
                    {error && <Alert>{error}</Alert>}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <button
                            onClick={() => handleTranslate(false)}
                            disabled={!inputText || isLoading}
                            className={`px-6 py-2 rounded-lg flex items-center justify-center w-full sm:w-auto ${inputText && !isLoading
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <ArrowRightLeft className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            {isLoading ? 'Translating...' : 'Translate'}
                        </button>

                        {translatedText && (
                            <>
                                {/* Copy button */}
                                <button
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(translatedText);
                                            setCopySuccess(true);
                                            setTimeout(() => setCopySuccess(false), 2000);
                                        } catch (err) {
                                            console.error('Failed to copy text:', err);
                                        }
                                    }}
                                    className="px-6 py-2 rounded-lg flex items-center justify-center w-full sm:w-auto bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    {copySuccess ? (
                                        <>
                                            <ClipboardCheck className="mr-2 h-4 w-4 text-green-500" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <ClipboardCopy className="mr-2 h-4 w-4" />
                                            Copy
                                        </>
                                    )}
                                </button>

                                {/* Save button */}
                                <button
                                    onClick={handleSaveTranslation}
                                    className={`px-6 py-2 rounded-lg flex items-center justify-center w-full sm:w-auto transition-all duration-300 ${saveSuccess
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    {saveSuccess ? (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Saved!
                                        </>
                                    ) : (
                                        <>
                                            <BookmarkIcon className="mr-2 h-4 w-4" />
                                            Save
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default TranslatorApp;