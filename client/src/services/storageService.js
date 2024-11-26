import { MAX_HISTORY_ITEMS, MAX_SAVED_TRANSLATIONS } from '../constants';

// History management functions
export const loadHistory = (saveHistoryEnabled) => {
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

export const saveHistoryToStorage = (history, saveHistoryEnabled) => {
    if (saveHistoryEnabled) {
        localStorage.setItem('translationHistory', JSON.stringify(history));
    }
};

export const addToHistory = (history, newItem, saveHistoryEnabled) => {
    if (!saveHistoryEnabled) return history;
    
    const newHistory = [
        {
            ...newItem,
            timestamp: new Date().toISOString()
        },
        ...history
    ].slice(0, MAX_HISTORY_ITEMS);

    saveHistoryToStorage(newHistory, saveHistoryEnabled);
    return newHistory;
};

export const deleteHistoryItem = (history, index, saveHistoryEnabled) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    saveHistoryToStorage(newHistory, saveHistoryEnabled);
    return newHistory;
};

export const clearHistory = (saveHistoryEnabled) => {
    saveHistoryToStorage([], saveHistoryEnabled);
    return [];
};

// Saved translations management functions
export const loadSavedTranslations = () => {
    try {
        return JSON.parse(localStorage.getItem('savedTranslations')) || [];
    } catch {
        return [];
    }
};

export const saveSavedTranslations = (translations) => {
    localStorage.setItem('savedTranslations', JSON.stringify(translations));
};

export const addToSavedTranslations = (savedTranslations, newItem) => {
    const newSavedTranslations = [
        {
            ...newItem,
            timestamp: new Date().toISOString()
        },
        ...savedTranslations
    ].slice(0, MAX_SAVED_TRANSLATIONS);

    saveSavedTranslations(newSavedTranslations);
    return newSavedTranslations;
};

export const deleteSavedTranslation = (savedTranslations, index) => {
    const newSavedTranslations = [...savedTranslations];
    newSavedTranslations.splice(index, 1);
    saveSavedTranslations(newSavedTranslations);
    return newSavedTranslations;
};

export const clearSavedTranslations = () => {
    saveSavedTranslations([]);
    return [];
};

// Voice settings management
export const saveVoiceSettings = (settings) => {
    localStorage.setItem('voiceSettings', JSON.stringify(settings));
};

export const loadVoiceSettings = () => {
    try {
        return JSON.parse(localStorage.getItem('voiceSettings')) || {};
    } catch {
        return {};
    }
};

// API keys management
export const saveApiKeys = (keys) => {
    Object.entries(keys).forEach(([key, value]) => {
        localStorage.setItem(`${key}_api_key`, value);
    });
};

export const loadApiKeys = () => {
    return {
        gemini: localStorage.getItem('gemini_api_key') || '',
        openrouter: localStorage.getItem('openrouter_api_key') || '',
        openai: localStorage.getItem('openai_api_key') || ''
    };
};

// Other settings management
export const saveSettings = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const loadSettings = (key, defaultValue) => {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? JSON.parse(value) : defaultValue;
    } catch {
        return defaultValue;
    }
};
