import { useState, useCallback } from 'react';
import { translateWithGemini, translateWithOpenRouter, translateWithOpenAI, translateWithAnthropic } from '../services/translationService';

const useTranslation = (saveHistory, onUpdateHistory) => {
    const [inputText, setInputText] = useState('');
    const [translations, setTranslations] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [translationController, setTranslationController] = useState(null);
    const [showSafetyWarning, setShowSafetyWarning] = useState(false);
    const [isParaphraserMode, setIsParaphraserMode] = useState(false);

    // Languages are valid as long as they exist in the (merged) language map.
    const validateLanguageSupport = (sourceLang, targetLang, LANGUAGE_NAMES) => {
        const supportedLanguages = Object.keys(LANGUAGE_NAMES || {});

        if (sourceLang !== 'auto' && !supportedLanguages.includes(sourceLang)) {
            throw new Error(`Unsupported source language: ${sourceLang}`);
        }

        if (!supportedLanguages.includes(targetLang)) {
            throw new Error(`Unsupported target language: ${targetLang}`);
        }
    };

    // model: { name, api: 'google'|'openrouter'|'openai'|'anthropic', modelSlug }
    const handleTranslate = useCallback(async (
        isAdditional = false,
        model,
        apiKeys,
        modelInstructions,
        selectedTone,
        sourceLang,
        targetLang,
        LANGUAGE_NAMES,
        additionalInstruction = ''
    ) => {
        try {
            setIsLoading(true);
            setError('');
            validateLanguageSupport(sourceLang, targetLang, LANGUAGE_NAMES);

            // Create AbortController for cancellation
            const controller = new AbortController();
            setTranslationController(controller);

            // Modify the instructions based on paraphraser mode
            const modifiedInstructions = {
                ...modelInstructions,
                'pre-instruction': isParaphraserMode
                    ? 'You are a professional paraphraser. Rewrite the text in a different way while maintaining its original meaning and tone.'
                    : modelInstructions['pre-instruction']
            };

            const actualModelName = model?.name || '';
            const effectiveTargetLang = isParaphraserMode ? sourceLang : targetLang;
            const previous = isAdditional ? translations : [];

            let translatedResult;
            switch (model?.api) {
                case 'google':
                    translatedResult = await translateWithGemini(
                        inputText,
                        previous,
                        controller.signal,
                        apiKeys.gemini,
                        modifiedInstructions,
                        selectedTone,
                        sourceLang,
                        effectiveTargetLang,
                        LANGUAGE_NAMES,
                        isParaphraserMode,
                        model.modelSlug,
                        additionalInstruction
                    );
                    break;
                case 'openrouter':
                    translatedResult = await translateWithOpenRouter(
                        inputText,
                        previous,
                        controller.signal,
                        apiKeys.openrouter,
                        modifiedInstructions,
                        selectedTone,
                        sourceLang,
                        effectiveTargetLang,
                        LANGUAGE_NAMES,
                        isParaphraserMode,
                        model.modelSlug,
                        additionalInstruction
                    );
                    break;
                case 'openai':
                    translatedResult = await translateWithOpenAI(
                        inputText,
                        previous,
                        controller.signal,
                        apiKeys.openai,
                        modifiedInstructions,
                        selectedTone,
                        sourceLang,
                        effectiveTargetLang,
                        LANGUAGE_NAMES,
                        isParaphraserMode,
                        model.modelSlug,
                        additionalInstruction
                    );
                    break;
                case 'anthropic':
                    translatedResult = await translateWithAnthropic(
                        inputText,
                        previous,
                        controller.signal,
                        apiKeys.anthropic,
                        modifiedInstructions,
                        selectedTone,
                        sourceLang,
                        effectiveTargetLang,
                        LANGUAGE_NAMES,
                        isParaphraserMode,
                        model.modelSlug,
                        additionalInstruction
                    );
                    break;
                default:
                    throw new Error('Invalid model selected');
            }

            if (!translatedResult) throw new Error('No translation result.');

            if (isAdditional) {
                setTranslations(prev => [...prev, {
                    text: translatedResult,
                    timestamp: new Date(),
                    modelName: actualModelName
                }]);
                setCurrentIndex(translations.length);
            } else {
                setTranslations([{
                    text: translatedResult,
                    timestamp: new Date(),
                    modelName: actualModelName
                }]);
                setCurrentIndex(0);
            }

            // Update history if enabled
            if (saveHistory) {
                const historyItem = {
                    inputText,
                    translatedText: translatedResult,
                    model: model?.api,
                    modelName: actualModelName,
                    timestamp: new Date().toISOString()
                };
                onUpdateHistory(historyItem);
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
    }, [inputText, translations, isParaphraserMode, saveHistory, onUpdateHistory]);

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
        model,
        apiKeys,
        modelInstructions,
        selectedTone,
        sourceLang,
        targetLang,
        LANGUAGE_NAMES,
        additionalInstruction = ''
    ) => {
        if (currentIndex < translations.length - 1) {
            // If we have more translations in history, just move to the next one
            setCurrentIndex(currentIndex + 1);
        } else if (inputText) {
            // If we're at the last translation and have input text, request a new alternative translation
            await handleTranslate(
                true, // isAdditional = true to keep previous translations
                model,
                apiKeys,
                modelInstructions,
                selectedTone,
                sourceLang,
                targetLang,
                LANGUAGE_NAMES,
                additionalInstruction
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
        translatedText: translations[currentIndex]?.text || '',
        currentTranslation: translations[currentIndex],
        isParaphraserMode,
        setIsParaphraserMode
    };
};

export default useTranslation;
