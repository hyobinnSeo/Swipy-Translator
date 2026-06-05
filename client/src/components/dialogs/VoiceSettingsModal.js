import React, { useState } from 'react';
import { X } from 'lucide-react';
import DialogWrapper from './DialogWrapper';
import { LANGUAGE_NAMES, GEMINI_VOICES, LANGUAGE_VOICE_MAPPING } from '../../constants';

const VoiceSettingsModal = ({ isOpen, onClose, selectedVoices, onVoiceChange, darkMode }) => {
    const [localVoices, setLocalVoices] = useState(selectedVoices);
    const [stylePrompt, setStylePrompt] = useState(() => {
        try {
            return localStorage.getItem('ttsStylePrompt') || '';
        } catch {
            return '';
        }
    });

    // Reset to defaults
    const handleReset = () => {
        // Use the default voice mappings from constants
        setLocalVoices(LANGUAGE_VOICE_MAPPING);
        setStylePrompt('');
    };

    // Save changes
    const handleSave = () => {
        // Save to localStorage for persistence
        localStorage.setItem('selectedVoices', JSON.stringify(localVoices));
        localStorage.setItem('ttsStylePrompt', stylePrompt);
        onVoiceChange(localVoices);
        onClose();
    };

    return (
        <DialogWrapper 
            isOpen={isOpen} 
            onClose={onClose} 
            className="w-full max-w-2xl max-h-[90vh] flex flex-col"
            darkMode={darkMode}
        >
            <div className={`flex-shrink-0 p-6 border-b ${
                darkMode ? 'border-slate-700' : ''
            }`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className={`text-xl font-semibold ${
                            darkMode ? 'text-slate-100' : ''
                        }`}>Voice Settings</h2>
                        <p className={`text-sm mt-1 ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}>Select a Gemini-TTS voice for each language</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className={`${
                            darkMode 
                                ? 'text-slate-400 hover:text-slate-200' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    {/* Speaking style (Gemini-TTS prompt) */}
                    <div className="space-y-2">
                        <label className={`block text-sm font-medium ${
                            darkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                            말하기 스타일 (선택):
                        </label>
                        <textarea
                            value={stylePrompt}
                            onChange={(e) => setStylePrompt(e.target.value)}
                            placeholder="예: 차분하고 전문적인 다큐멘터리 내레이터 톤으로 읽어줘"
                            rows={2}
                            className={`w-full p-2 rounded-lg text-sm resize-y focus:ring-2 ${
                                darkMode
                                    ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-500/30 placeholder-slate-400'
                                    : 'border focus:ring-gray-500 placeholder-gray-400'
                            }`}
                        />
                        <div className={`text-xs leading-relaxed ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}>
                            <p>자연어로 어조·감정·속도를 지정할 수 있습니다. 예시:</p>
                            <ul className="list-disc list-inside space-y-0.5 mt-1">
                                <li>속삭임: <code>아주 조용히 속삭이듯이 말해줘</code> 또는 <code>[whispering]</code></li>
                                <li>감정: <code>신나고 밝은 톤으로</code> / <code>겁에 질린 목소리로</code></li>
                                <li>속도: <code>천천히 또박또박</code> / 빠르게는 <code>[extremely fast]</code></li>
                                <li>일시중지: <code>[short pause]</code>, <code>[long pause]</code></li>
                            </ul>
                            <p className="mt-1">모든 언어·보이스에 공통 적용됩니다. 비워두면 기본 톤으로 재생됩니다.</p>
                        </div>
                    </div>

                    {Object.keys(LANGUAGE_VOICE_MAPPING).map((lang) => (
                        <div key={lang} className="space-y-2">
                            <label className={`block text-sm font-medium ${
                                darkMode ? 'text-slate-300' : 'text-gray-700'
                            }`}>
                                {LANGUAGE_NAMES[lang]}:
                            </label>
                            <select
                                value={localVoices[lang] || LANGUAGE_VOICE_MAPPING[lang]}
                                onChange={(e) => setLocalVoices(prev => ({
                                    ...prev,
                                    [lang]: e.target.value
                                }))}
                                className={`w-full p-2 rounded-lg focus:ring-2 ${
                                    darkMode 
                                        ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-500/30' 
                                        : 'border focus:ring-gray-500'
                                }`}
                            >
                                {GEMINI_VOICES.map((voice) => (
                                    <option 
                                        key={voice.id} 
                                        value={voice.id}
                                        className={darkMode ? 'bg-slate-700' : ''}
                                    >
                                        {voice.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`flex-shrink-0 p-6 border-t ${
                darkMode ? 'border-slate-700 bg-slate-800' : 'bg-white'
            }`}>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleReset}
                        className={`px-4 py-2 ${
                            darkMode 
                                ? 'text-slate-300 hover:text-slate-100' 
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={handleSave}
                        className={`px-4 py-2 text-white rounded-lg ${
                            darkMode 
                                ? 'bg-navy-400 hover:bg-navy-500' 
                                : 'bg-navy-500 hover:bg-navy-600'
                        }`}
                    >
                        Done
                    </button>
                </div>
            </div>
        </DialogWrapper>
    );
};

export default VoiceSettingsModal;
