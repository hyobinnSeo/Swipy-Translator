import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

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
                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-gray-500"
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
                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-gray-500"
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

export default LanguageSelector;
