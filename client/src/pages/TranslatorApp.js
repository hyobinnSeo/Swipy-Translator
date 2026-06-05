import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { MenuIcon, Wand2, X } from 'lucide-react';

// Import components
import Alert from '../components/common/Alert';
import ActionButton from '../components/common/ActionButton';
import LanguageSelector from '../components/LanguageSelector';
import ToneSelector from '../components/ToneSelector';
import TextArea from '../components/TextArea';
import Sidebar from '../components/Sidebar';
import VoiceSettingsModal from '../components/dialogs/VoiceSettingsModal';
import InstructionsModal from '../components/dialogs/InstructionsModal';
import CustomizeModal from '../components/dialogs/CustomizeModal';
import SettingsDialog from '../components/dialogs/SettingsDialog';
import HistoryPanel from '../components/dialogs/HistoryPanel';
import SavedTranslationsDialog from '../components/dialogs/SavedTranslationsDialog';
import SafetyWarningDialog from '../components/dialogs/SafetyWarningDialog';
import Copyright from '../components/Copyright';

// Import hooks
import useTranslation from '../hooks/useTranslation';
import useTranslationStorage from '../hooks/useTranslationStorage';
import useDialogs from '../hooks/useDialogs';
import useSwipe from '../hooks/useSwipe';
import useCustomConfig from '../hooks/useCustomConfig';

// Import constants
import {
    TONES,
    DEFAULT_INSTRUCTIONS,
    AVAILABLE_MODELS,
    LANGUAGE_NAMES,
    LANGUAGE_VOICE_MAPPING
} from '../constants';

const TranslatorApp = () => {
    // Settings and configuration state
    const [selectedModelName, setSelectedModelName] = useState(AVAILABLE_MODELS[0].name);
    const [modelInstructions, setModelInstructions] = useState(DEFAULT_INSTRUCTIONS);
    const [sourceLang, setSourceLang] = useState('auto');
    const [targetLang, setTargetLang] = useState('en');
    const [selectedTone, setSelectedTone] = useState('standard');
    // Ad-hoc, per-translation extra instruction. Hidden by default; only shown when needed.
    const [additionalInstruction, setAdditionalInstruction] = useState('');
    const [showAdditionalInstruction, setShowAdditionalInstruction] = useState(false);
    const [maxLength, setMaxLength] = useState(parseInt(localStorage.getItem('maxInputLength')) || 5000);
    const [isFixedSize, setIsFixedSize] = useState(JSON.parse(localStorage.getItem('isFixedSize') || 'false'));
    const [saveHistory, setSaveHistory] = useState(JSON.parse(localStorage.getItem('saveHistory') ?? 'true'));
    const [darkMode, setDarkMode] = useState(JSON.parse(localStorage.getItem('darkMode') ?? 'false'));
    const [copySuccess, setCopySuccess] = useState(false);
    const [selectedVoices, setSelectedVoices] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('voiceSettings')) || { ...LANGUAGE_VOICE_MAPPING };
        } catch {
            return { ...LANGUAGE_VOICE_MAPPING };
        }
    });
    const [apiKeys, setApiKeys] = useState(() => ({
        gemini: localStorage.getItem('gemini_api_key') || '',
        openrouter: localStorage.getItem('openrouter_api_key') || '',
        openai: localStorage.getItem('openai_api_key') || '',
        anthropic: localStorage.getItem('anthropic_api_key') || ''
    }));

    // Apply dark mode class to root element
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Custom hooks
    const {
        inputText,
        setInputText,
        translations,
        setTranslations,
        currentIndex,
        setCurrentIndex,
        isLoading,
        error,
        showSafetyWarning,
        setShowSafetyWarning,
        handleTranslate,
        handleCancelTranslation,
        handleClear,
        handlePrevious,
        handleNext,
        translatedText,
        isParaphraserMode,
        setIsParaphraserMode
    } = useTranslation(saveHistory, (historyItem) => addToHistory(historyItem));

    const {
        history,
        savedTranslations,
        saveSuccess,
        addToHistory,
        deleteHistoryItem,
        clearHistory,
        saveTranslation,
        deleteSavedTranslation,
        clearSavedTranslations
    } = useTranslationStorage(saveHistory);

    const {
        isSidebarOpen,
        isHistoryOpen,
        isInstructionsOpen,
        isSavedOpen,
        isVoiceSettingsOpen,
        isSettingsOpen,
        openSidebar,
        closeSidebar,
        openHistory,
        closeHistory,
        openInstructions,
        closeInstructions,
        openSaved,
        closeSaved,
        openVoiceSettings,
        closeVoiceSettings,
        openSettings,
        closeSettings,
        isCustomizeOpen,
        openCustomize,
        closeCustomize
    } = useDialogs();

    // User-defined config (stored on the server via Firestore)
    const customTones = useCustomConfig('tones');
    const customModels = useCustomConfig('models');
    const customLanguages = useCustomConfig('languages');

    // Built-in + custom, merged
    const allTones = [
        ...TONES,
        ...customTones.items.map(({ id, name, description }) => ({ id, name, description }))
    ];

    const allModels = [...AVAILABLE_MODELS, ...customModels.items];

    const allLanguageNames = {
        ...LANGUAGE_NAMES,
        ...customLanguages.items.reduce((acc, lang) => {
            acc[lang.code] = lang.name;
            return acc;
        }, {})
    };
    const allLanguages = Object.entries(allLanguageNames).map(([code, name]) => ({ code, name }));

    // The model currently selected for translation
    const selectedModelEntry = allModels.find(m => m.name === selectedModelName) || allModels[0];

    // Inject custom tone instructions so the translation service can use them
    const effectiveInstructions = {
        ...modelInstructions,
        'tone-instructions': {
            ...modelInstructions['tone-instructions'],
            ...customTones.items.reduce((acc, tone) => {
                acc[tone.id] = tone.instruction || '';
                return acc;
            }, {})
        }
    };

    const swipeHandlers = useSwipe(() => handleNext(
        selectedModelEntry,
        apiKeys,
        effectiveInstructions,
        selectedTone,
        sourceLang,
        targetLang,
        allLanguageNames,
        additionalInstruction
    ), handlePrevious);

    // Effects
    useEffect(() => {
        // Reset tone to standard if the current tone isn't in the available tone list
        if (!allTones.find(tone => tone.id === selectedTone)) {
            setSelectedTone('standard');
        }
    }, [selectedTone, customTones.items]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // Reset language selection if a chosen (custom) language was removed
        if (sourceLang !== 'auto' && !allLanguageNames[sourceLang]) {
            setSourceLang('auto');
        }
        if (!allLanguageNames[targetLang]) {
            setTargetLang('en');
        }
    }, [customLanguages.items]); // eslint-disable-line react-hooks/exhaustive-deps

    // Settings handlers
    const handleApiKeysChange = (newApiKeys) => {
        setApiKeys(newApiKeys);

        // Store API keys in localStorage
        localStorage.setItem('gemini_api_key', newApiKeys.gemini);
        localStorage.setItem('openrouter_api_key', newApiKeys.openrouter);
        localStorage.setItem('openai_api_key', newApiKeys.openai);
        localStorage.setItem('anthropic_api_key', newApiKeys.anthropic || '');
    };

    const handleDarkModeChange = (newValue) => {
        setDarkMode(newValue);
        localStorage.setItem('darkMode', JSON.stringify(newValue));
    };

    const handleToggleFixedSize = () => {
        setIsFixedSize(prev => {
            const newValue = !prev;
            localStorage.setItem('isFixedSize', JSON.stringify(newValue));
            return newValue;
        });
    };

    const handleVoiceChange = (newVoices) => {
        setSelectedVoices(newVoices);
        localStorage.setItem('voiceSettings', JSON.stringify(newVoices));
    };

    const handleMaxLengthChange = (newMaxLength) => {
        setMaxLength(newMaxLength);
        localStorage.setItem('maxInputLength', newMaxLength.toString());
    };

    const baseUrl = process.env.PUBLIC_URL || '/';

    return (
        <div className={`w-full min-h-screen ${darkMode ? 'dark bg-gray-800' : 'bg-gray-50'}`}>
            <Helmet>
                <title>Swipy</title>
                <meta name="description" content="Multi-language translation application" />
            </Helmet>

            {/* Modals and Dialogs */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={closeSidebar}
                onOpenHistory={openHistory}
                onOpenInstructions={openInstructions}
                onOpenSaved={openSaved}
                onOpenVoiceSettings={openVoiceSettings}
                onOpenSettings={openSettings}
                onOpenCustomize={openCustomize}
                isFixedSize={isFixedSize}
                onToggleFixedSize={handleToggleFixedSize}
                isParaphraserMode={isParaphraserMode}
                onToggleParaphraserMode={() => {
                    setIsParaphraserMode(prev => !prev);
                    setTranslations([]);
                    setCurrentIndex(0);
                }}
                darkMode={darkMode}
            />

            <HistoryPanel
                isOpen={isHistoryOpen}
                onClose={closeHistory}
                history={history}
                onSelectHistory={(item) => {
                    setInputText(item.inputText);
                    setTranslations([{ 
                        text: item.translatedText, 
                        timestamp: new Date(),
                        modelName: item.modelName 
                    }]);
                    setCurrentIndex(0);
                    closeHistory();
                }}
                onDeleteHistory={deleteHistoryItem}
                onClearHistory={clearHistory}
                darkMode={darkMode}
            />

            <SavedTranslationsDialog
                isOpen={isSavedOpen}
                onClose={closeSaved}
                savedTranslations={savedTranslations}
                onSelectSaved={(item) => {
                    setInputText(item.inputText);
                    setTranslations([{ 
                        text: item.translatedText, 
                        timestamp: new Date(),
                        modelName: item.modelName 
                    }]);
                    setCurrentIndex(0);
                }}
                onDeleteSaved={deleteSavedTranslation}
                onClearAll={clearSavedTranslations}
                darkMode={darkMode}
            />

            <InstructionsModal
                isOpen={isInstructionsOpen}
                onClose={closeInstructions}
                modelInstructions={modelInstructions}
                setModelInstructions={setModelInstructions}
                selectedTone={selectedTone}
                darkMode={darkMode}
                isParaphraserMode={isParaphraserMode}
            />

            <VoiceSettingsModal
                isOpen={isVoiceSettingsOpen}
                onClose={closeVoiceSettings}
                selectedVoices={selectedVoices}
                onVoiceChange={handleVoiceChange}
                darkMode={darkMode}
            />

            <CustomizeModal
                isOpen={isCustomizeOpen}
                onClose={closeCustomize}
                darkMode={darkMode}
                tones={{
                    builtIn: TONES,
                    custom: customTones.items,
                    isLoading: customTones.isLoading,
                    error: customTones.error,
                    add: customTones.addItem,
                    remove: customTones.removeItem
                }}
                models={{
                    builtIn: AVAILABLE_MODELS,
                    custom: customModels.items,
                    isLoading: customModels.isLoading,
                    error: customModels.error,
                    add: customModels.addItem,
                    remove: customModels.removeItem
                }}
                languages={{
                    builtIn: Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({ code, name })),
                    custom: customLanguages.items,
                    isLoading: customLanguages.isLoading,
                    error: customLanguages.error,
                    add: customLanguages.addItem,
                    remove: customLanguages.removeItem
                }}
            />

            <SafetyWarningDialog
                isOpen={showSafetyWarning}
                onClose={() => setShowSafetyWarning(false)}
                darkMode={darkMode}
            />

            <SettingsDialog
                isOpen={isSettingsOpen}
                onClose={closeSettings}
                maxLength={maxLength}
                onMaxLengthChange={handleMaxLengthChange}
                saveHistory={saveHistory}
                onSaveHistoryChange={(newValue) => {
                    setSaveHistory(newValue);
                    localStorage.setItem('saveHistory', JSON.stringify(newValue));
                    if (!newValue) {
                        clearHistory();
                    }
                }}
                darkMode={darkMode}
                onDarkModeChange={handleDarkModeChange}
                onPreviewDarkModeChange={setDarkMode}
                apiKeys={apiKeys}
                onApiKeysChange={handleApiKeysChange}
            />

            {/* Header */}
            <div className={`w-full border-b ${darkMode
                ? 'bg-slate-700/50 border-slate-700/50 backdrop-blur-sm'
                : 'bg-white'
                }`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center px-4 py-2.5 space-x-4">
                        <button
                            onClick={openSidebar}
                            className={`${darkMode
                                ? 'text-slate-300 hover:text-slate-100'
                                : 'text-gray-600 hover:text-gray-800'
                                } transition-colors`}
                            title="Menu"
                        >
                            <MenuIcon className="h-6 w-6" />
                        </button>

                        <a
                            href={baseUrl}
                            className={`text-xl font-semibold ${darkMode
                                ? 'text-slate-100 hover:text-white'
                                : 'text-gray-800 hover:text-gray-600'
                                } transition-colors cursor-pointer`}
                        >
                            Swipy
                        </a>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 py-2">
                <div className="space-y-1">
                    {/* Model selector */}
                    <div className="w-full">
                        <select
                            value={selectedModelName}
                            onChange={(e) => setSelectedModelName(e.target.value)}
                            className={`w-[200px] p-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${darkMode
                                ? 'bg-navy-900 border-navy-800/50 text-slate-400 hover:bg-navy-800'
                                : 'bg-white'
                                } transition-colors`}
                        >
                            {allModels.map((model) => (
                                <option key={model.id || model.name} value={model.name}
                                    className={darkMode ? 'bg-slate-800' : 'bg-white'}
                                >
                                    {model.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Language selector */}
                    <div className="mt-1">
                        <LanguageSelector
                            sourceLang={sourceLang}
                            targetLang={targetLang}
                            onSourceChange={setSourceLang}
                            onTargetChange={setTargetLang}
                            inputText={inputText}
                            translatedText={translatedText}
                            onInputTextChange={setInputText}
                            onTranslatedTextChange={(text) => {
                                setTranslations([{ 
                                    text, 
                                    timestamp: new Date(),
                                    modelName: selectedModelName 
                                }]);
                                setCurrentIndex(0);
                            }}
                            onResetTranslations={() => {
                                setTranslations([]);
                                setCurrentIndex(0);
                            }}
                            hideTargetLanguage={isParaphraserMode}
                            languages={allLanguages}
                            darkMode={darkMode}
                        />
                    </div>

                    {/* Tone selector + additional instruction toggle */}
                    <div className="mt-1 mb-1">
                        <div className="flex items-center justify-between">
                            <ToneSelector
                                selectedTone={selectedTone}
                                onToneChange={setSelectedTone}
                                tones={allTones}
                                darkMode={darkMode}
                            />

                            <button
                                type="button"
                                onClick={() => setShowAdditionalInstruction(prev => !prev)}
                                className={`p-2 rounded-lg transition-colors ${
                                    showAdditionalInstruction || additionalInstruction.trim()
                                        ? (darkMode ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-50')
                                        : (darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50')
                                }`}
                                title="Add a one-off instruction for this translation"
                            >
                                <Wand2 className="w-4 h-4" />
                            </button>
                        </div>

                        {showAdditionalInstruction && (
                            <div className="relative mt-1">
                                <textarea
                                    value={additionalInstruction}
                                    onChange={(e) => setAdditionalInstruction(e.target.value)}
                                    placeholder="e.g. Keep technical terms in English, use a formal tone..."
                                    rows={2}
                                    className={`w-full p-2 pr-8 border rounded-md text-sm resize-y focus:ring-2 focus:ring-blue-500 ${
                                        darkMode
                                            ? 'bg-navy-900/80 text-slate-100 border-slate-600 focus:border-blue-500 placeholder-slate-400'
                                            : 'bg-white border-gray-300 placeholder-gray-400'
                                    }`}
                                />
                                {additionalInstruction && (
                                    <button
                                        type="button"
                                        onClick={() => setAdditionalInstruction('')}
                                        className={`absolute top-2 right-2 ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600'}`}
                                        title="Clear"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Text areas */}
                    <div className="flex flex-col md:flex-row gap-2 md:gap-6 mb-3">
                        <TextArea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Enter text..."
                            showSpeaker={true}
                            maxLength={maxLength}
                            onClear={handleClear}
                            language={sourceLang}
                            selectedVoice={selectedVoices[sourceLang]}
                            isFixedSize={isFixedSize}
                            darkMode={darkMode}
                            className={darkMode ? 'bg-navy-900/80 text-slate-100 border-slate-600 focus:border-blue-500 placeholder-slate-400' : ''}
                        />

                        <TextArea
                            value={translatedText}
                            isOutput={true}
                            onChange={(e) => {
                                const newText = e.target.value;
                                setTranslations(prev =>
                                    prev.map((item, index) =>
                                        index === currentIndex
                                            ? { ...item, text: newText }
                                            : item
                                    )
                                );
                            }}
                            placeholder={isParaphraserMode ? "Paraphrased text will appear here..." : "Translation will appear here..."}
                            showSpeaker={true}
                            {...swipeHandlers}
                            translations={translations}
                            currentIndex={currentIndex}
                            onPrevious={handlePrevious}
                            onNext={() => handleNext(
                                selectedModelEntry,
                                apiKeys,
                                effectiveInstructions,
                                selectedTone,
                                sourceLang,
                                targetLang,
                                allLanguageNames,
                                additionalInstruction
                            )}
                            onClear={() => {
                                setTranslations([]);
                                setCurrentIndex(0);
                            }}
                            language={isParaphraserMode ? sourceLang : targetLang}
                            selectedVoice={selectedVoices[isParaphraserMode ? sourceLang : targetLang]}
                            isFixedSize={isFixedSize}
                            darkMode={darkMode}
                            className={darkMode ? 'bg-navy-900/80 text-slate-100 border-slate-700/50 focus:border-blue-500 placeholder-slate-400'
                                : ''}
                        />
                    </div>

                    {/* Error message */}
                    {error && (
                        <Alert className={darkMode ? 'bg-red-900/50 text-red-200 border-red-800' : ''}>
                            {error}
                        </Alert>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <ActionButton
                            type={isParaphraserMode ? "paraphrase" : "translate"}
                            onClick={() => handleTranslate(
                                false,
                                selectedModelEntry,
                                apiKeys,
                                effectiveInstructions,
                                selectedTone,
                                sourceLang,
                                targetLang,
                                allLanguageNames,
                                additionalInstruction
                            )}
                            disabled={!inputText}
                            isLoading={isLoading}
                            onCancel={handleCancelTranslation}
                            darkMode={darkMode}
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
                                    darkMode={darkMode}
                                />

                                <ActionButton
                                    type="save"
                                    onClick={() => saveTranslation(inputText, translatedText, selectedModelEntry?.api)}
                                    isActive={saveSuccess}
                                    darkMode={darkMode}
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Copyright notice */}
                <Copyright darkMode={darkMode} />
            </div>
        </div>
    );
};

export default TranslatorApp;
