import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { MenuIcon } from 'lucide-react';

// Import components
import Alert from '../components/common/Alert';
import ActionButton from '../components/common/ActionButton';
import LanguageSelector from '../components/LanguageSelector';
import ToneSelector from '../components/ToneSelector';
import TextArea from '../components/TextArea';
import Sidebar from '../components/Sidebar';
import VoiceSettingsModal from '../components/dialogs/VoiceSettingsModal';
import InstructionsModal from '../components/dialogs/InstructionsModal';
import RequestLogViewer from '../components/dialogs/RequestLogViewer';
import SettingsDialog from '../components/dialogs/SettingsDialog';
import HistoryPanel from '../components/dialogs/HistoryPanel';
import SavedTranslationsDialog from '../components/dialogs/SavedTranslationsDialog';
import SafetyWarningDialog from '../components/dialogs/SafetyWarningDialog';

// Import hooks
import useTranslation from '../hooks/useTranslation';
import useTranslationStorage from '../hooks/useTranslationStorage';
import useDialogs from '../hooks/useDialogs';
import useSwipe from '../hooks/useSwipe';

// Import constants
import {
    MODELS,
    TONES,
    DEFAULT_INSTRUCTIONS,
    APP_VERSION,
    MIN_SECURE_VERSION,
    AVAILABLE_MODELS,
    LANGUAGE_NAMES
} from '../constants';

const TranslatorApp = () => {
    // Settings and configuration state
    const [selectedModel, setSelectedModel] = useState(MODELS.GEMINI);
    const [modelInstructions, setModelInstructions] = useState(DEFAULT_INSTRUCTIONS);
    const [sourceLang, setSourceLang] = useState('auto');
    const [targetLang, setTargetLang] = useState('en');
    const [selectedTone, setSelectedTone] = useState('standard');
    const [maxLength, setMaxLength] = useState(parseInt(localStorage.getItem('maxInputLength')) || 5000);
    const [isFixedSize, setIsFixedSize] = useState(JSON.parse(localStorage.getItem('isFixedSize') || 'false'));
    const [saveHistory, setSaveHistory] = useState(JSON.parse(localStorage.getItem('saveHistory') ?? 'true'));
    const [copySuccess, setCopySuccess] = useState(false);
    const [apiKeys, setApiKeys] = useState(() => ({
        gemini: localStorage.getItem('gemini_api_key') || '',
        openrouter: localStorage.getItem('openrouter_api_key') || '',
        openai: localStorage.getItem('openai_api_key') || ''
    }));
    const [selectedVoices, setSelectedVoices] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('voiceSettings')) || {
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
        } catch {
            return {};
        }
    });

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
        isRequestLogOpen,
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
        openRequestLog,
        closeRequestLog,
        openVoiceSettings,
        closeVoiceSettings,
        openSettings,
        closeSettings
    } = useDialogs();

    const swipeHandlers = useSwipe(() => handleNext(
        selectedModel,
        apiKeys,
        modelInstructions,
        selectedTone,
        sourceLang,
        targetLang,
        LANGUAGE_NAMES
    ), handlePrevious);

    // Effects
    useEffect(() => {
        // Reset tone to standard when changing models if current tone isn't available
        const modelTones = TONES[selectedModel] || TONES[MODELS.GEMINI];
        if (!modelTones.find(tone => tone.id === selectedTone)) {
            setSelectedTone('standard');
        }
    }, [selectedModel, selectedTone]);

    // Settings handlers
    const handleApiKeysChange = (newApiKeys) => {
        setApiKeys(newApiKeys);
        localStorage.setItem('gemini_api_key', newApiKeys.gemini);
        localStorage.setItem('openrouter_api_key', newApiKeys.openrouter);
        localStorage.setItem('openai_api_key', newApiKeys.openai);
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

    // Version security check
    const isVersionSecure = (currentVersion, minVersion) => {
        const current = currentVersion.split('.').map(Number);
        const min = minVersion.split('.').map(Number);

        for (let i = 0; i < 3; i++) {
            if (current[i] > min[i]) return true;
            if (current[i] < min[i]) return false;
        }
        return true;
    };

    if (!isVersionSecure(APP_VERSION, MIN_SECURE_VERSION)) {
        localStorage.removeItem('translator_auth');
        return <Navigate to="/" replace />;
    }

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
                onClose={closeSidebar}
                onOpenHistory={openHistory}
                onOpenInstructions={openInstructions}
                onOpenSaved={openSaved}
                onOpenRequestLog={openRequestLog}
                onOpenVoiceSettings={openVoiceSettings}
                onOpenSettings={openSettings}
                isFixedSize={isFixedSize}
                onToggleFixedSize={handleToggleFixedSize}
                isParaphraserMode={isParaphraserMode}
                onToggleParaphraserMode={() => {
                    setIsParaphraserMode(prev => !prev);
                    setTranslations([]);
                    setCurrentIndex(0);
                }}
            />

            <HistoryPanel
                isOpen={isHistoryOpen}
                onClose={closeHistory}
                history={history}
                onSelectHistory={(item) => {
                    setInputText(item.inputText);
                    setTranslations([{ text: item.translatedText, timestamp: new Date() }]);
                    setCurrentIndex(0);
                    closeHistory();
                }}
                onDeleteHistory={deleteHistoryItem}
                onClearHistory={clearHistory}
            />

            <SavedTranslationsDialog
                isOpen={isSavedOpen}
                onClose={closeSaved}
                savedTranslations={savedTranslations}
                onSelectSaved={(item) => {
                    setInputText(item.inputText);
                    setTranslations([{ text: item.translatedText, timestamp: new Date() }]);
                    setCurrentIndex(0);
                }}
                onDeleteSaved={deleteSavedTranslation}
                onClearAll={clearSavedTranslations}
            />

            <InstructionsModal
                isOpen={isInstructionsOpen}
                onClose={closeInstructions}
                modelInstructions={modelInstructions}
                selectedModel={selectedModel}
                setModelInstructions={setModelInstructions}
                selectedTone={selectedTone}
            />

            <VoiceSettingsModal
                isOpen={isVoiceSettingsOpen}
                onClose={closeVoiceSettings}
                selectedVoices={selectedVoices}
                onVoiceChange={handleVoiceChange}
            />

            <RequestLogViewer
                isOpen={isRequestLogOpen}
                onClose={closeRequestLog}
                requestLog={null}
            />

            <SafetyWarningDialog
                isOpen={showSafetyWarning}
                onClose={() => setShowSafetyWarning(false)}
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
                apiKeys={apiKeys}
                onApiKeysChange={handleApiKeysChange}
            />

            {/* Header */}
            <div className="w-full border-b bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center p-4 space-x-4">
                        <button
                            onClick={openSidebar}
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
                    <div className="mt-2">
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
                            hideTargetLanguage={isParaphraserMode}
                        />
                    </div>

                    {/* Tone selector */}
                    <div className="mt-2 mb-2">
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
                            onClear={handleClear}
                            language={sourceLang}
                            selectedVoice={selectedVoices[sourceLang]}
                            isFixedSize={isFixedSize}
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
                                selectedModel,
                                apiKeys,
                                modelInstructions,
                                selectedTone,
                                sourceLang,
                                targetLang,
                                LANGUAGE_NAMES
                            )}
                            onClear={() => {
                                setTranslations([]);
                                setCurrentIndex(0);
                            }}
                            language={isParaphraserMode ? sourceLang : targetLang}
                            selectedVoice={selectedVoices[isParaphraserMode ? sourceLang : targetLang]}
                            isFixedSize={isFixedSize}
                        />
                    </div>

                    {/* Error message */}
                    {error && <Alert>{error}</Alert>}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                        <ActionButton
                            type={isParaphraserMode ? "paraphrase" : "translate"}
                            onClick={() => handleTranslate(
                                false,
                                selectedModel,
                                apiKeys,
                                modelInstructions,
                                selectedTone,
                                sourceLang,
                                targetLang,
                                LANGUAGE_NAMES
                            )}
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
                                    onClick={() => saveTranslation(inputText, translatedText, selectedModel)}
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
