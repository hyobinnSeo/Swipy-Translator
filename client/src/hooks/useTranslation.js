import { useState, useCallback } from 'react';
import { translateWithGemini, translateWithOpenRouter, translateWithOpenAI } from '../services/translationService';
import { MODELS } from '../constants';

const useTranslation = (saveHistory, onUpdateHistory) => {
    const [inputText, setInputText] = useState('');
    const [translations, setTranslations] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [translationController, setTranslationController] = useState(null);
    const [showSafetyWarning, setShowSafetyWarning] = useState(false);

    const validateLanguageSupport = (sourceLang, targetLang) => {
        const supportedLanguages = ['auto', 'en', 'fr', 'es', 'it', 'de', 'pt', 'ja', 'ko', 'zh', 'ar'];

        if (sourceLang !== 'auto' && !supportedLanguages.includes(sourceLang)) {
            throw new Error(`Unsupported source language: ${sourceLang}`);
        }

        if (!supportedLanguages.includes(targetLang)) {
            throw new Error(`Unsupported target language: ${targetLang}`);
        }
    };

    const handleTranslate = async (
        isAdditional = false,
        selectedModel,
        apiKeys,
        modelInstructions,
        selectedTone,
        sourceLang,
        targetLang,
        LANGUAGE_NAMES
    ) => {
        try {
            setIsLoading(true);
            setError('');
            validateLanguageSupport(sourceLang, targetLang);

            // Create AbortController for cancellation
            const controller = new AbortController();
            setTranslationController(controller);

            let translatedResult;
            try {
                switch (selectedModel) {
                    case MODELS.GEMINI:
                        translatedResult = await translateWithGemini(
                            inputText,
                            isAdditional ? translations : [],
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
                    case MODELS.ANTHROPIC:
                        translatedResult = await translateWithOpenRouter(
                            inputText,
                            selectedModel,
                            isAdditional ? translations : [],
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
                            isAdditional ? translations : [],
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

                if (!translatedResult) throw new Error('No translation result.');

                if (isAdditional) {
                    setTranslations(prev => [...prev, { text: translatedResult, timestamp: new Date() }]);
                    setCurrentIndex(translations.length);
                } else {
                    setTranslations([{ text: translatedResult, timestamp: new Date() }]);
                    setCurrentIndex(0);
                }

                // Update history if enabled
                if (saveHistory) {
                    const historyItem = {
                        inputText,
                        translatedText: translatedResult,
                        model: selectedModel,
                        timestamp: new Date().toISOString()
                    };
                    onUpdateHistory(historyItem);
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
        }
    };

    const handleCancelTranslation = useCallback(() => {
        if (translationController) {
            translationController.abort();
        }
    }, [translationController]);

    const handleClear = useCallback(() => {
        setInputText('');
        setTranslations([]);
        setCurrentIndex(0);
        setError('');
    }, []);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    }, [currentIndex]);

    const handleNext = useCallback(async (
        selectedModel,
        apiKeys,
        modelInstructions,
        selectedTone,
        sourceLang,
        targetLang,
        LANGUAGE_NAMES
    ) => {
        if (currentIndex < translations.length - 1) {
            // If we have more translations in history, just move to the next one
            setCurrentIndex(currentIndex + 1);
        } else if (inputText) {
            // If we're at the last translation and have input text, request a new alternative translation
            await handleTranslate(
                true, // isAdditional = true to keep previous translations
                selectedModel,
                apiKeys,
                modelInstructions,
                selectedTone,
                sourceLang,
                targetLang,
                LANGUAGE_NAMES
            );
        }
    }, [currentIndex, translations.length, inputText, handleTranslate]);

    return {
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
        translatedText: translations[currentIndex]?.text || ''
    };
};

export default useTranslation;
