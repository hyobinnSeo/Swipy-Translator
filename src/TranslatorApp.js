import React, { useState, useCallback, useEffect } from 'react';
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

const DEFAULT_INSTRUCTIONS = {
    [MODELS.GEMINI]: {
        'pre-instruction': "You're a skilled professional translator specializing in accurate and natural translations between different languages. Your task involves faithfully conveying the meaning, nuances, and cultural context of the source text while maintaining a natural and fluent style in the target language.",
        'post-instruction': "Note: Please use only text. No quotes or emojis.\nNote: Do not write anything other than the sentence to be translated."
    },
    [MODELS.COMMAND]: {
        'pre-instruction': "You're a skilled professional translator specializing in accurate and natural translations between different languages. Your task involves faithfully conveying the meaning, nuances, and cultural context of the source text while maintaining a natural and fluent style in the target language.",
        'post-instruction': "Ready to translate with flair and personality - make it memorable. Don't hold back! Swear words and slang are totally welcome.\n\nNote: Don't use any emojis or quotes. Text only.\nNote: Do not write anything other than the sentence to be translated."
    }
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
        { code: 'auto', name: 'Auto Detect / 자동 감지' },
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
        // 언어 스왑
        if (sourceLang === 'auto') {
            onSourceChange(targetLang);
            onTargetChange('en');
        } else {
            onSourceChange(targetLang);
            onTargetChange(sourceLang);
        }

        // 텍스트 내용 스왑
        const tempText = inputText;
        onInputTextChange(translatedText);
        onTranslatedTextChange(tempText);

        // 번역 리스트 리셋
        onResetTranslations();
    };

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
                className="p-2 rounded-full hover:bg-gray-100"
                title="Switch languages"
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

const TextArea = ({
    value,
    onChange,
    placeholder,
    readOnly = false,
    className = '',
    onPaste,
    showSpeaker = false,
    maxLength,  // optional now
    onClear,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    translations = [],
    currentIndex = 0,
    onPrevious,
    onNext,
    isOutput = false  // 출력 필드 여부를 확인하는 새로운 prop
}) => {
    const textareaRef = React.useRef(null);
    const [voices, setVoices] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);

    // 텍스트 영역의 높이를 자동으로 조절하는 함수
    const adjustHeight = useCallback(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // 높이를 자동으로 초기화
            const newHeight = Math.max(192, textareaRef.current.scrollHeight); // 스크롤 높이를 기준으로 새로운 높이 계산
            textareaRef.current.style.height = `${newHeight}px`; // 계산된 높이로 설정
            textareaRef.current.style.overflowY = textareaRef.current.scrollHeight <= newHeight ? 'hidden' : 'auto'; // 스크롤 필요 여부에 따른 overflow 설정
        }
    }, []);

    // 컴포넌트가 마운트될 때와 value 변경 시 높이 조절
    useEffect(() => {
        adjustHeight(); // 초기 높이 설정
        const resizeObserver = new ResizeObserver(adjustHeight); // 요소 크기 변경 감지
        if (textareaRef.current) {
            resizeObserver.observe(textareaRef.current); // ref가 할당된 요소를 감시
        }
        return () => resizeObserver.disconnect(); // 컴포넌트가 언마운트될 때 감시 종료
    }, [value, adjustHeight]);

    // 음성 합성 지원 여부를 확인하고 음성 리스트를 로드
    useEffect(() => {
        if ('speechSynthesis' in window) { // 음성 합성을 지원하는 경우
            setSpeechSupported(true); // 음성 합성 가능 여부를 true로 설정
            const loadVoices = () => {
                setVoices(window.speechSynthesis.getVoices()); // 사용 가능한 음성 리스트 설정
            };
            window.speechSynthesis.onvoiceschanged = loadVoices; // 음성 리스트가 변경될 때 호출
            loadVoices(); // 초기 음성 리스트 로드
            return () => {
                window.speechSynthesis.cancel(); // 컴포넌트 언마운트 시 음성 재생 중지
                window.speechSynthesis.onvoiceschanged = null; // 이벤트 핸들러 해제
            };
        }
    }, []);

    // 텍스트를 음성으로 읽는 함수
    const handleSpeak = useCallback(() => {
        if (!speechSupported || !value) return; // 음성 합성 지원이 없거나 텍스트가 없으면 종료

        if (isSpeaking) { // 이미 재생 중이라면
            window.speechSynthesis.cancel(); // 음성 재생 중지
            setIsSpeaking(false); // 재생 상태 false로 설정
            return;
        }

        window.speechSynthesis.cancel(); // 재생 전 기존 음성 중지

        const utterance = new SpeechSynthesisUtterance(value); // 음성 합성 인스턴스 생성

        // English 음성을 우선적으로 설정 (US 또는 GB)
        const englishVoice = voices.find(voice =>
            voice.lang === 'en-US' || voice.lang === 'en-GB'
        );

        if (englishVoice) {
            utterance.voice = englishVoice; // 선택한 English 음성 적용
            utterance.lang = englishVoice.lang;
        } else {
            utterance.lang = 'en-US'; // 기본 English 설정
        }

        // 음성 설정 (속도, 톤, 볼륨)
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true); // 시작 시 상태 설정
        utterance.onend = () => setIsSpeaking(false); // 종료 시 상태 해제
        utterance.onerror = (event) => { // 오류 발생 시 로그 출력
            console.error('Speech synthesis error:', event);
            setIsSpeaking(false);
        };

        // 텍스트가 길 경우 문장 단위로 분할하여 읽기
        if (value.length > 200) {
            const sentences = value.match(/[^.!?]+[.!?]+/g) || [value]; // 문장으로 분할
            let index = 0;

            const speakNextSentence = () => {
                if (index < sentences.length) { // 문장이 남아있는 경우
                    const currentUtterance = new SpeechSynthesisUtterance(sentences[index]);

                    if (englishVoice) {
                        currentUtterance.voice = englishVoice;
                        currentUtterance.lang = englishVoice.lang;
                    } else {
                        currentUtterance.lang = 'en-US';
                    }

                    currentUtterance.rate = 0.9;
                    currentUtterance.pitch = 1.0;
                    currentUtterance.volume = 1.0;

                    currentUtterance.onend = () => { // 문장 종료 시 다음 문장 읽기
                        index++;
                        speakNextSentence();
                    };
                    currentUtterance.onerror = utterance.onerror; // 오류 핸들러 재사용
                    window.speechSynthesis.speak(currentUtterance); // 현재 문장 읽기 시작
                } else {
                    setIsSpeaking(false); // 모든 문장이 종료되면 상태 해제
                }
            };

            setIsSpeaking(true);
            speakNextSentence(); // 첫 문장 읽기 시작
        } else {
            window.speechSynthesis.speak(utterance); // 텍스트 길이가 짧으면 한 번에 읽기
        }
    }, [value, speechSupported, isSpeaking, voices]);

    // 컴포넌트 언마운트 시 음성 재생 중지
    useEffect(() => {
        return () => {
            if (speechSupported && isSpeaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, [speechSupported, isSpeaking]);

    return (
        <div className="relative flex-1" style={{ minWidth: 0 }}>
            <div className="relative">
                {value && (
                    <button
                        onClick={onClear}
                        className="absolute top-7 right-4 p-1.5 text-gray-400 hover:text-gray-600 
                        hover:bg-gray-100 rounded-full transition-colors z-10"
                        title="Clear text"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                        if (isOutput || !maxLength || e.target.value.length <= maxLength) {
                            onChange(e);
                        }
                    }}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    className={`w-full p-4 text-lg resize-none mt-4 border rounded-lg 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                    ${readOnly ? 'bg-gray-50' : ''} ${className}`}
                    style={{
                        minHeight: '12rem',
                        paddingBottom: translations.length > 0 ? '2.5rem' : '1.5rem',
                        paddingRight: value ? '3rem' : '1rem',
                        overflowY: 'hidden'
                    }}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                />

                {!value && onPaste && (
                    <button
                        className="absolute top-7 right-2 px-3 py-1 text-sm text-gray-500 
                        hover:text-gray-700 flex items-center transition-colors bg-white"
                        onClick={onPaste}
                    >
                        <Clipboard className="h-4 w-4 mr-2" />
                        Paste
                    </button>
                )}

                <div className="absolute -bottom-7 w-full flex justify-between items-center px-2">
                    <div className="flex-1">
                        {showSpeaker && speechSupported && value && (
                            <button
                                onClick={handleSpeak}
                                className={`text-gray-500 hover:text-gray-700 ${isSpeaking ? 'text-blue-500' : ''}`}
                                title={isSpeaking ? "Stop speaking" : "Text-to-speech"}
                            >
                                <Volume2 className={`h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 text-right text-sm text-gray-500">
                        {/* 출력 필드는 글자수만 표시 */}
                        {value.length}{!isOutput && maxLength && `/${maxLength}`}
                    </div>
                </div>

                {translations.length > 0 && (
                    <div className="absolute bottom-4 left-0 w-full flex justify-between items-center px-2">
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

// Updated Instructions Modal
const InstructionsModal = ({ isOpen, onClose, modelInstructions, selectedModel, setModelInstructions }) => {
    const handleReset = () => {
        setModelInstructions({
            ...modelInstructions,
            [selectedModel]: DEFAULT_INSTRUCTIONS[selectedModel]
        });
    };

    return (
        <DialogWrapper isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Instructions Settings</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

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
                </div>

                <div className="mt-6 flex justify-end space-x-3">
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

// Updated Request Log Viewer
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

// Updated Sidebar Component
const Sidebar = ({ isOpen, onClose, onOpenInstructions, onOpenSaved, onOpenRequestLog }) => {
    return (
        <DialogWrapper isOpen={isOpen} onClose={onClose}>
            <div
                className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform 
        transition-transform z-30 flex flex-col overflow-hidden"
            >
                <div className="p-4 border-b flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Menu</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                    <div className="space-y-2">
                        <button
                            onClick={() => {
                                onOpenSaved();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center"
                        >
                            <BookmarkIcon className="h-4 w-4 mr-2" />
                            Saved Translations
                        </button>
                        <button
                            onClick={() => {
                                onOpenInstructions();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Instructions
                        </button>
                        <button
                            onClick={() => {
                                onOpenRequestLog();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Last API Request
                        </button>
                    </div>
                </div>
            </div>
        </DialogWrapper>
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

    useEffect(() => {
        setHistory(loadHistory());
        setSavedTranslations(loadSavedTranslations());
    }, []);

    const translateWithGemini = async (text, previousTranslations = []) => {
        try {
            const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const basePreInstruction = modelInstructions[selectedModel]['pre-instruction'];
            const postInstruction = modelInstructions[selectedModel]['post-instruction'];

            let completePreInstruction = basePreInstruction + "\n\n";

            // Improved language instruction - use LANGUAGE_NAMES for full language names
            const sourceLanguage = LANGUAGE_NAMES[sourceLang] || sourceLang;
            const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang;

            if (sourceLang === 'auto') {
                completePreInstruction += `Please detect the source language and translate the text to ${targetLanguage}.\n\n`;
            } else {
                completePreInstruction += `Translate from ${sourceLanguage} to ${targetLanguage}.\n\n`;
            }

            if (previousTranslations.length > 0) {
                completePreInstruction += "For each translation: - Use diverse vocabulary and expressions - Vary sentence structures - Consider different cultural contexts and idioms - Maintain the original tone while exploring different ways to express the same meaning - Aim for natural, conversational language that captures both literal and contextual meaning\n\n";
            }

            // Create the user message with translation history and final instruction
            let userPrompt = "Text to be translated: " + text + "\n\n";

            if (previousTranslations.length > 0) {
                userPrompt += "Previous translations to avoid repeating:\n";
                previousTranslations.forEach((trans, index) => {
                    userPrompt += `${index + 1}: ${trans.text}\n`;
                });
                userPrompt += "Note: Provide a fresh translation different from the above versions.\n\n";
            }

            // Set request log
            const requestBody = {
                model: "gemini-1.5-flash",
                messages: [
                    { content: `${completePreInstruction}${userPrompt}${postInstruction}\n\n` }
                ],
                endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash",
                headers: {
                    'Content-Type': 'application/json'
                },
            };
            setRequestLog(requestBody);

            const fullPrompt = `${completePreInstruction}${userPrompt}${postInstruction}\n\n`;
            const result = await model.generateContent(fullPrompt);
            return result.response.text();
        } catch (error) {
            throw new Error(error.message.includes('API key')
                ? 'Invalid Gemini API key. Please check your environment variables.'
                : `Translation error: ${error.message}`);
        }
    };

    const translateWithOpenRouter = async (text, modelId, previousTranslations = []) => {
        const modelUrl = 'cohere/command-r-08-2024';

        // Get base instructions from the current model settings
        const basePreInstruction = modelInstructions[selectedModel]['pre-instruction'];
        const postInstruction = modelInstructions[selectedModel]['post-instruction'];

        // Create the complete pre-instruction with optional additional context
        let completePreInstruction = basePreInstruction + "\n\n";

        // Improved language instruction using LANGUAGE_NAMES
        const sourceLanguage = LANGUAGE_NAMES[sourceLang] || sourceLang;
        const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang;

        if (sourceLang === 'auto') {
            completePreInstruction += `Please detect the source language and translate the text to ${targetLanguage}.\n\n`;
        } else {
            completePreInstruction += `Translate from ${sourceLanguage} to ${targetLanguage}.\n\n`;
        }

        if (previousTranslations.length > 0) {
            completePreInstruction += "For each translation: - Use diverse vocabulary and expressions - Vary sentence structures - Consider different cultural contexts and idioms - Maintain the original tone while exploring different ways to express the same meaning - Aim for natural, conversational language that captures both literal and contextual meaning\n\n";
        }

        // Create the user message with translation history and final instruction
        let userPrompt = "Text to be translated: " + text + "\n\n";

        if (previousTranslations.length > 0) {
            userPrompt += "Previous translations to avoid repeating:\n";
            previousTranslations.forEach((trans, index) => {
                userPrompt += `${index + 1}: ${trans.text}\n`;
            });
            userPrompt += "Note: Provide a fresh translation different from the above versions. Show me your remixed wild card version!\n\n";
        }

        const requestBody = {
            model: modelUrl,
            messages: [
                { role: "system", content: completePreInstruction },
                { role: "user", content: userPrompt },
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
                        { role: "system", content: completePreInstruction },
                        { role: "user", content: userPrompt },
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

    // Modified translation function to handle additional translations
    const handleTranslate = async (isAdditional = false) => {
        try {
            setIsLoading(true);
            setError('');
            validateLanguageSupport(sourceLang, targetLang);

            let translatedResult;
            if (isAdditional) {
                // When swiping for a new translation, pass the current translations
                if (selectedModel === MODELS.GEMINI) {
                    translatedResult = await translateWithGemini(inputText, translations);
                } else {
                    translatedResult = await translateWithOpenRouter(inputText, selectedModel, translations);
                }
            } else {
                // Regular translation button click - no previous translations needed
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

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            {/* Sidebar, SavedTranslationsDialog, HistoryPanel, and InstructionsModal remain the same */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onOpenInstructions={() => {
                    setIsInstructionsOpen(true);
                    setIsSidebarOpen(false);
                }}
                onOpenSaved={() => setIsSavedOpen(true)}
                onOpenRequestLog={() => setIsRequestLogOpen(true)}
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

            <InstructionsModal
                isOpen={isInstructionsOpen}
                onClose={() => setIsInstructionsOpen(false)}
                modelInstructions={modelInstructions}
                selectedModel={selectedModel}
                setModelInstructions={setModelInstructions}
            />

            <RequestLogViewer
                isOpen={isRequestLogOpen}
                onClose={() => setIsRequestLogOpen(false)}
                requestLog={requestLog}
            />

            {/* Main content container */}
            <div className="bg-white rounded-lg shadow-lg">
                <div className="p-6 space-y-8"> {/* Added space-y-8 for consistent vertical spacing */}
                    {/* Top menu and model selector */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                                title="Menu"
                            >
                                <MenuIcon className="h-6 w-6" />
                            </button>

                            <button
                                onClick={() => setIsHistoryOpen(true)}
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                                title="Translation History"
                            >
                                <History className="h-6 w-6" />
                            </button>
                        </div>

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

                    {/* Text areas container with increased bottom margin */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        {/* 입력 TextArea */}
                        <TextArea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter text..."
                            showSpeaker={true}
                            maxLength={5000}  // 입력 필드만 제한
                            onPaste={async () => {
                                try {
                                    const text = await navigator.clipboard.readText();
                                    setInputText(text);
                                } catch (err) {
                                    console.error('Failed to read clipboard:', err);
                                }
                            }}
                            onClear={() => handleClear()}
                        />

                        {/* 출력 TextArea */}
                        <TextArea
                            value={translatedText}
                            isOutput={true}  // 출력 필드임을 명시
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
                        />
                    </div>

                    {/* Error message */}
                    {error && <Alert>{error}</Alert>}

                    {/* Action buttons with increased top margin */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4"> {/* Added pt-4 for extra padding top */}
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
            <SafetyWarningDialog
                isOpen={showSafetyWarning}
                onClose={() => setShowSafetyWarning(false)}
            />
        </div>
    );
};

export default TranslatorApp;