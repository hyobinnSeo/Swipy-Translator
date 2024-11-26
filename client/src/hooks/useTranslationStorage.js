import { useState, useCallback } from 'react';

const MAX_HISTORY_ITEMS = 100;
const MAX_SAVED_TRANSLATIONS = 100;

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

const useTranslationStorage = (saveHistoryEnabled = true) => {
    const [history, setHistory] = useState(() => loadHistory(saveHistoryEnabled));
    const [savedTranslations, setSavedTranslations] = useState(() => loadSavedTranslations());
    const [saveSuccess, setSaveSuccess] = useState(false);

    const addToHistory = useCallback((historyItem) => {
        if (saveHistoryEnabled) {
            setHistory(prev => {
                const newHistory = [historyItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
                saveHistoryToStorage(newHistory, saveHistoryEnabled);
                return newHistory;
            });
        }
    }, [saveHistoryEnabled]);

    const deleteHistoryItem = useCallback((index) => {
        setHistory(prev => {
            const newHistory = [...prev];
            newHistory.splice(index, 1);
            saveHistoryToStorage(newHistory, saveHistoryEnabled);
            return newHistory;
        });
    }, [saveHistoryEnabled]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        saveHistoryToStorage([], saveHistoryEnabled);
    }, [saveHistoryEnabled]);

    const saveTranslation = useCallback((inputText, translatedText, model) => {
        if (!inputText || !translatedText) return;

        const newSavedTranslation = {
            inputText,
            translatedText,
            model,
            timestamp: new Date().toISOString()
        };

        setSavedTranslations(prev => {
            const updatedTranslations = [newSavedTranslation, ...prev].slice(0, MAX_SAVED_TRANSLATIONS);
            saveSavedTranslations(updatedTranslations);
            return updatedTranslations;
        });

        // Show success feedback
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    }, []);

    const deleteSavedTranslation = useCallback((index) => {
        setSavedTranslations(prev => {
            const newSavedTranslations = [...prev];
            newSavedTranslations.splice(index, 1);
            saveSavedTranslations(newSavedTranslations);
            return newSavedTranslations;
        });
    }, []);

    const clearSavedTranslations = useCallback(() => {
        setSavedTranslations([]);
        saveSavedTranslations([]);
    }, []);

    return {
        history,
        savedTranslations,
        saveSuccess,
        addToHistory,
        deleteHistoryItem,
        clearHistory,
        saveTranslation,
        deleteSavedTranslation,
        clearSavedTranslations
    };
};

export default useTranslationStorage;
