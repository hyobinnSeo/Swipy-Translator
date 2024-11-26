import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
    X,
    FileText,
    MenuIcon,
    Settings,
    History,
    Trash2,
    BookmarkIcon,
    Search,
    Folder,
    Volume2,
    AlertTriangle
} from 'lucide-react';

// Import components
import Alert from './components/common/Alert';
import ActionButton from './components/common/ActionButton';
import LanguageSelector from './components/LanguageSelector';
import ToneSelector from './components/ToneSelector';
import TextArea from './components/TextArea';
import Sidebar from './components/Sidebar';
import VoiceSettingsModal from './components/dialogs/VoiceSettingsModal';
import InstructionsModal from './components/dialogs/InstructionsModal';
import RequestLogViewer from './components/dialogs/RequestLogViewer';
import SettingsDialog from './components/dialogs/SettingsDialog';
import DialogWrapper from './components/dialogs/DialogWrapper';

// Import services
import { translateWithGemini, translateWithOpenRouter, translateWithOpenAI } from './services/translationService';
import * as storageService from './services/storageService';

// Import constants
import {
    MODELS,
    TONES,
    LANGUAGE_NAMES,
    DEFAULT_INSTRUCTIONS,
    AVAILABLE_MODELS,
    getToneInstructions,
    APP_VERSION,
    MIN_SECURE_VERSION,
    MAX_SAVED_TRANSLATIONS,
    MAX_HISTORY_ITEMS
} from './constants';

// History loading function - should respect the saveHistory setting
const loadHistory = (saveHistoryEnabled) => {
    try {
        // Only load history if the feature is enabled
        if (saveHistoryEnabled) {
            return JSON.parse(localStorage.getItem('translationHistory')) || [];
        }
        return [];
    } catch {
        return [];
    }
};

// History saving function - should respect the saveHistory setting
const saveHistoryToStorage = (history, saveHistoryEnabled) => {
    if (saveHistoryEnabled) {
        localStorage.setItem('translationHistory', JSON.stringify(history));
    }
};

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

const saveVoiceSettings = (settings) => {
    localStorage.setItem('voiceSettings', JSON.stringify(settings));
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
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-3 focus:ring-gray-500"
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
    // All hooks declarations
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
    const [maxLength, setMaxLength] = useState(parseInt(localStorage.getItem('maxInputLength')) || 5000);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFixedSize, setIsFixedSize] = useState(false);
    const [translationController, setTranslationController] = useState(null);
    const [saveHistory, setSaveHistory] = useState(
        JSON.parse(localStorage.getItem('saveHistory') ?? 'true')
    );
    const [apiKeys, setApiKeys] = useState(() => ({
        gemini: localStorage.getItem('gemini_api_key') || '',
        openrouter: localStorage.getItem('openrouter_api_key') || '',
        openai: localStorage.getItem('openai_api_key') || ''
    }));

    // All useEffect hooks
    useEffect(() => {
        // Reset tone to standard when changing models if current tone isn't available
        const modelTones = TONES[selectedModel] || TONES[MODELS.GEMINI];
        if (!modelTones.find(tone => tone.id === selectedTone)) {
            setSelectedTone('standard');
        }
    }, [selectedModel, selectedTone]);

    useEffect(() => {
        // Load history based on the current saveHistory setting
        setHistory(loadHistory(saveHistory));
        setSavedTranslations(loadSavedTranslations());
    }, [saveHistory]); // Add saveHistory as a dependency

    useEffect(() => {
        const savedFixedSize = localStorage.getItem('isFixedSize');
        if (savedFixedSize !== null) {
            setIsFixedSize(JSON.parse(savedFixedSize));
        }
    }, []);

    const handleApiKeysChange = (newApiKeys) => {
        setApiKeys(newApiKeys);
        localStorage.setItem('gemini_api_key', newApiKeys.gemini);
        localStorage.setItem('openrouter_api_key', newApiKeys.openrouter);
        localStorage.setItem('openai_api_key', newApiKeys.openai);
    };

    // Add the handleToggleFixedSize function
    const handleToggleFixedSize = () => {
        setIsFixedSize(prev => {
            const newValue = !prev;
            localStorage.setItem('isFixedSize', JSON.stringify(newValue));
            return newValue;
        });
    };

    // Version check function
    const isVersionSecure = (currentVersion, minVersion) => {
        const current = currentVersion.split('.').map(Number);
        const min = minVersion.split('.').map(Number);

        for (let i = 0; i < 3; i++) {
            if (current[i] > min[i]) return true;
            if (current[i] < min[i]) return false;
        }
        return true;
    };

    // Version security check after all hooks
    if (!isVersionSecure(APP_VERSION, MIN_SECURE_VERSION)) {
        localStorage.removeItem('translator_auth');
        return <Navigate to="/" replace />;
    }

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
        saveHistoryToStorage(newHistory, saveHistory);
    };

    const clearAllHistory = () => {
        setHistory([]);
        saveHistoryToStorage([], saveHistory);
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

        // Create AbortController for cancellation
        const controller = new AbortController();
        setTranslationController(controller);

        let translatedResult;
        try {
            if (isAdditional) {
                switch (selectedModel) {
                    case MODELS.GEMINI:
                        translatedResult = await translateWithGemini(
                            inputText, 
                            translations, 
                            controller.signal, 
                            apiKeys.gemini,
                            modelInstructions,
                            selectedModel,
                            selectedTone,
                            sourceLang,
                            targetLang,
                            LANGUAGE_NAMES
                        );
                        break;
                    case MODELS.COMMAND:
                        translatedResult = await translateWithOpenRouter(
                            inputText, 
                            selectedModel, 
                            translations, 
                            controller.signal, 
                            apiKeys.openrouter,
                            modelInstructions,
                            selectedModel,
                            selectedTone,
                            sourceLang,
                            targetLang,
                            LANGUAGE_NAMES
                        );
                        break;
                    case MODELS.ANTHROPIC:
                        translatedResult = await translateWithOpenRouter(
                            inputText, 
                            selectedModel, 
                            translations, 
                            controller.signal, 
                            apiKeys.openrouter,
                            modelInstructions,
                            selectedModel,
                            selectedTone,
                            sourceLang,
                            targetLang,
                            LANGUAGE_NAMES
                        );
                        break;
                    case MODELS.OPENAI:
                        translatedResult = await translateWithOpenAI(
                            inputText, 
                            translations, 
                            controller.signal, 
                            apiKeys.openai,
                            modelInstructions,
                            selectedModel,
                            selectedTone,
                            sourceLang,
                            targetLang,
                            LANGUAGE_NAMES
                        );
                        break;
                    default:
                        throw new Error('Invalid model selected');
                }
            } else {
                switch (selectedModel) {
                    case MODELS.GEMINI:
                        translatedResult = await translateWithGemini(
                            inputText, 
                            [], 
                            controller.signal, 
                            apiKeys.gemini,
                            modelInstructions,
                            selectedModel,
                            selectedTone,
                            sourceLang,
                            targetLang,
                            LANGUAGE_NAMES
                        );
                        break;
                    case MODELS.COMMAND:
                        translatedResult = await translateWithOpenRouter(
                            inputText, 
                            selectedModel, 
                            [], 
                            controller.signal, 
                            apiKeys.openrouter,
                            modelInstructions,
                            selectedModel,
                            selectedTone,
                            sourceLang,
                            targetLang,
                            LANGUAGE_NAMES
                        );
                        break;
                    case MODELS.ANTHROPIC:
                        translatedResult = await translateWithOpenRouter(
                            inputText, 
                            selectedModel, 
                            [], 
                            controller.signal, 
                            apiKeys.openrouter,
                            modelInstructions,
                            selectedModel,
                            selectedTone,
                            sourceLang,
                            targetLang,
                            LANGUAGE_NAMES
                        );
                        break;
                    case MODELS.OPENAI:
                        translatedResult = await translateWithOpenAI(
                            inputText, 
                            [], 
                            controller.signal, 
                            apiKeys.openai,
                            modelInstructions,
                            selectedModel,
                            selectedTone,
                            sourceLang,
                            targetLang,
                            LANGUAGE_NAMES
                        );
                        break;
                    default:
                        throw new Error('Invalid model selected');
                }
            }

            if (!translatedResult) throw new Error('No translation result.');

            if (isAdditional) {
                setTranslations(prev => [...prev, { text: translatedResult, timestamp: new Date() }]);
                setCurrentIndex(translations.length);
            } else {
                setTranslations([{ text: translatedResult, timestamp: new Date() }]);
                setCurrentIndex(0);
            }

            // Inside handleTranslate, modify the history section:
            if (saveHistory) {
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
                saveHistoryToStorage(newHistory, saveHistory);
            }

        } catch (err) {
            throw err;
        }

    } catch (err) {
        if (err.name === 'AbortError') {
            // Don't set error for cancelled translations
            return;
        } else if (err.message.includes('SAFETY')) {
            setShowSafetyWarning(true);
        } else {
            setError(err.message);
        }
    } finally {
        setIsLoading(false);
        setTranslationController(null);
        setCopySuccess(false);
    }
};

    const handleCancelTranslation = () => {
        if (translationController) {
            translationController.abort();
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

    const handleMaxLengthChange = (newMaxLength) => {
        setMaxLength(newMaxLength);
        localStorage.setItem('maxInputLength', newMaxLength.toString());
    };

    const baseUrl = process.env.PUBLIC_URL || '/';

    return (
        <div className="w-full min-h-screen bg-gray-50">
            <Helmet>
                <title>Hoochoo Translator</title>
                <meta name="description" content="Multi-language translation application" />
            </Helmet>
            {/* Modals and Dialogs */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onOpenHistory={() => setIsHistoryOpen(true)}
                onOpenInstructions={() => setIsInstructionsOpen(true)}
                onOpenSaved={() => setIsSavedOpen(true)}
                onOpenRequestLog={() => setIsRequestLogOpen(true)}
                onOpenVoiceSettings={() => setIsVoiceSettingsOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                isFixedSize={isFixedSize}  // Add this prop
                onToggleFixedSize={handleToggleFixedSize}  // Add this prop
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
                className="w-full max-w-2xl max-h-[90vh] flex flex-col"
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

            <SettingsDialog
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                maxLength={maxLength}
                onMaxLengthChange={handleMaxLengthChange}
                saveHistory={saveHistory}
                onSaveHistoryChange={(newValue) => {
                    setSaveHistory(newValue);
                    localStorage.setItem('saveHistory', JSON.stringify(newValue));
                    if (!newValue) {
                        setHistory([]);
                        localStorage.removeItem('translationHistory');
                    }
                }}
                apiKeys={apiKeys}
                onApiKeysChange={handleApiKeysChange}
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
                            className="w-[200px] p-2 border rounded-md focus:ring-2 focus:ring-gray-500"
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
                        <TextArea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter text..."
                            showSpeaker={true}
                            maxLength={maxLength}
                            onClear={() => handleClear()}
                            language={sourceLang}
                            selectedVoice={selectedVoices[sourceLang]}
                            isFixedSize={isFixedSize}  // Add this prop
                        />

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
                            isFixedSize={isFixedSize}  // Add this prop
                        />
                    </div>

                    {/* Error message */}
                    {error && <Alert>{error}</Alert>}

                    {/* Action buttons */}
                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <ActionButton
                            type="translate"
                            onClick={() => handleTranslate(false)}
                            disabled={!inputText}
                            isLoading={isLoading}
                            onCancel={handleCancelTranslation}
                        />

                        {translatedText && (
                            <>
                                <ActionButton
                                    type="copy"
                                    onClick={async () => {
                                        try {
                                            await navigator.clipboard.writeText(translatedText);
                                            setCopySuccess(true);
                                            setTimeout(() => setCopySuccess(false), 2000);
                                        } catch (err) {
                                            console.error('Failed to copy text:', err);
                                        }
                                    }}
                                    isActive={copySuccess}
                                />

                                <ActionButton
                                    type="save"
                                    onClick={handleSaveTranslation}
                                    isActive={saveSuccess}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default TranslatorApp;