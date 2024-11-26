import React, { useState } from 'react';
import { X } from 'lucide-react';
import DialogWrapper from './DialogWrapper';
import { LANGUAGE_NAMES, VOICE_OPTIONS } from '../../constants';

const VoiceSettingsModal = ({ isOpen, onClose, selectedVoices, onVoiceChange }) => {
    const [localVoices, setLocalVoices] = useState(selectedVoices);

    // Reset to defaults
    const handleReset = () => {
        const defaultVoices = {
            'en': 'en-US-JennyNeural',
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
        setLocalVoices(defaultVoices);
    };

    // Save changes
    const handleSave = () => {
        onVoiceChange(localVoices);
        onClose();
    };

    return (
        <DialogWrapper isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex-shrink-0 p-6 border-b">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold">Voice Settings</h2>
                        <p className="text-sm text-gray-500 mt-1">Select preferred voices for each language</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    {Object.entries(VOICE_OPTIONS).map(([lang, voices]) => (
                        <div key={lang} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {LANGUAGE_NAMES[lang]}:
                            </label>
                            <select
                                value={localVoices[lang] || ''}
                                onChange={(e) => setLocalVoices(prev => ({
                                    ...prev,
                                    [lang]: e.target.value
                                }))}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-gray-500"
                            >
                                {voices.map((voice) => (
                                    <option key={voice.id} value={voice.id}>
                                        {voice.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-shrink-0 p-6 border-t bg-white">
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-navy-500 hover:text-navy-600"
                    >
                        Reset to Default
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-navy-500 text-white rounded-lg hover:bg-navy-600"
                    >
                        Done
                    </button>
                </div>
            </div>
        </DialogWrapper>
    );
};

export default VoiceSettingsModal;
