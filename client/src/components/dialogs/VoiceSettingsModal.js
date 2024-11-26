import React, { useState } from 'react';
import { X } from 'lucide-react';
import DialogWrapper from './DialogWrapper';
import { LANGUAGE_NAMES, VOICE_OPTIONS, LANGUAGE_VOICE_MAPPING } from '../../constants';

const VoiceSettingsModal = ({ isOpen, onClose, selectedVoices, onVoiceChange, darkMode }) => {
    const [localVoices, setLocalVoices] = useState(selectedVoices);

    // Reset to defaults
    const handleReset = () => {
        // Use the default voice mappings from constants
        setLocalVoices(LANGUAGE_VOICE_MAPPING);
    };

    // Save changes
    const handleSave = () => {
        // Save to localStorage for persistence
        localStorage.setItem('selectedVoices', JSON.stringify(localVoices));
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
                        }`}>Select preferred voices for each language</p>
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
                    {Object.entries(VOICE_OPTIONS).map(([lang, voices]) => (
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
                                {voices.map((voice) => (
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
