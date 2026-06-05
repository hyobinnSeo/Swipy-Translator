import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { TONES, DEFAULT_INSTRUCTIONS } from '../../constants';
import DialogWrapper from './DialogWrapper';

const InstructionsModal = ({ 
    isOpen, 
    onClose, 
    modelInstructions, 
    setModelInstructions, 
    selectedTone,
    darkMode,
    isParaphraserMode
}) => {
    const [showToneDropdown, setShowToneDropdown] = useState(false);
    const [selectedToneInstructions, setSelectedToneInstructions] = useState(selectedTone);
    
    useEffect(() => {
        const isCurrentToneValid = TONES.find(t => t.id === selectedTone);
        if (!isCurrentToneValid) {
            setSelectedToneInstructions(TONES[0]?.id || 'standard');
        } else {
            setSelectedToneInstructions(selectedTone);
        }
    }, [selectedTone, isOpen]);

    const handleReset = () => {
        setModelInstructions(DEFAULT_INSTRUCTIONS);
    };

    return (
        <DialogWrapper 
            isOpen={isOpen} 
            onClose={onClose}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col"
            darkMode={darkMode}
        >
            {/* Header */}
            <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : ''}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className={`text-xl font-semibold ${
                            darkMode ? 'text-slate-100' : ''
                        }`}>Instructions Settings</h2>
                        <p className={`text-sm mt-1 ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}>Configure {isParaphraserMode ? 'paraphrasing' : 'translation'} instructions</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className={`${darkMode 
                            ? 'text-slate-400 hover:text-slate-200' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    {/* Tone Selection */}
                    <div className="space-y-2">
                        <label className={`block text-sm font-medium ${
                            darkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                            {isParaphraserMode ? 'Paraphrasing' : 'Translation'} Tone:
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => setShowToneDropdown(!showToneDropdown)}
                                className={`w-full px-4 py-2 text-left rounded-lg flex justify-between items-center ${
                                    darkMode 
                                        ? 'bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600' 
                                        : 'bg-white border hover:bg-gray-50'
                                }`}
                            >
                                <span>
                                    {TONES.find(t => t.id === selectedToneInstructions)?.name || 'Standard'}
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            
                            {showToneDropdown && (
                                <div className={`absolute z-10 w-full mt-1 rounded-lg shadow-lg ${
                                    darkMode 
                                        ? 'bg-slate-700 border-slate-600' 
                                        : 'bg-white border'
                                }`}>
                                    {TONES.map((tone) => (
                                        <button
                                            key={tone.id}
                                            onClick={() => {
                                                setSelectedToneInstructions(tone.id);
                                                setShowToneDropdown(false);
                                            }}
                                            className={`w-full px-4 py-2 text-left first:rounded-t-lg last:rounded-b-lg ${
                                                darkMode 
                                                    ? 'hover:bg-slate-600 text-slate-100' 
                                                    : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="font-medium">{tone.name}</div>
                                            <div className={
                                                darkMode ? 'text-sm text-slate-400' : 'text-sm text-gray-500'
                                            }>{tone.description}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pre-translation Instructions */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                            Pre-{isParaphraserMode ? 'paraphrasing' : 'translation'} Instructions:
                        </label>
                        <textarea
                            value={modelInstructions[isParaphraserMode ? 'pre-instruction-paraphrase' : 'pre-instruction']}
                            onChange={(e) => setModelInstructions({
                                ...modelInstructions,
                                [isParaphraserMode ? 'pre-instruction-paraphrase' : 'pre-instruction']: e.target.value
                            })}
                            className={`w-full h-32 p-2 rounded-lg focus:ring-2 resize-none ${
                                darkMode 
                                    ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-500/30' 
                                    : 'border focus:ring-gray-500'
                            }`}
                        />
                    </div>

                    {/* Tone Instructions */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                            Tone-specific Instructions:
                        </label>
                        <textarea
                            value={modelInstructions['tone-instructions'][selectedToneInstructions]}
                            onChange={(e) => setModelInstructions({
                                ...modelInstructions,
                                'tone-instructions': {
                                    ...modelInstructions['tone-instructions'],
                                    [selectedToneInstructions]: e.target.value
                                }
                            })}
                            className={`w-full h-32 p-2 rounded-lg focus:ring-2 resize-none ${
                                darkMode 
                                    ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-500/30' 
                                    : 'border focus:ring-gray-500'
                            }`}
                        />
                    </div>

                    {/* Post-translation Instructions */}
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${
                            darkMode ? 'text-slate-300' : 'text-gray-700'
                        }`}>
                            Post-{isParaphraserMode ? 'paraphrasing' : 'translation'} Instructions:
                        </label>
                        <textarea
                            value={modelInstructions[isParaphraserMode ? 'post-instruction-paraphrase' : 'post-instruction']}
                            onChange={(e) => setModelInstructions({
                                ...modelInstructions,
                                [isParaphraserMode ? 'post-instruction-paraphrase' : 'post-instruction']: e.target.value
                            })}
                            className={`w-full h-32 p-2 rounded-lg focus:ring-2 resize-none ${
                                darkMode 
                                    ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-500/30' 
                                    : 'border focus:ring-gray-500'
                            }`}
                        />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${darkMode ? 'border-slate-700' : ''}`}>
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
                        onClick={onClose}
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

export default InstructionsModal;
