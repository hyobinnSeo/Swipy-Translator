import React, { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { MODELS, TONES, AVAILABLE_MODELS } from '../../constants';

const InstructionsModal = ({ 
    isOpen, 
    onClose, 
    modelInstructions, 
    selectedModel, 
    setModelInstructions, 
    selectedTone 
}) => {
    const [showToneDropdown, setShowToneDropdown] = useState(false);
    const [selectedModelForInstructions, setSelectedModelForInstructions] = useState(selectedModel);
    const [selectedToneInstructions, setSelectedToneInstructions] = useState(selectedTone);
    
    // Update selected model and tone when the modal opens or selected model changes
    useEffect(() => {
        setSelectedModelForInstructions(selectedModel);
        // Find a valid tone for the selected model
        const modelTones = TONES[selectedModel] || TONES[MODELS.GEMINI];
        const isCurrentToneValid = modelTones.find(t => t.id === selectedTone);
        if (!isCurrentToneValid) {
            setSelectedToneInstructions(modelTones[0]?.id || 'standard');
        } else {
            setSelectedToneInstructions(selectedTone);
        }
    }, [selectedModel, selectedTone, isOpen]);

    const handleModelChange = (newModel) => {
        setSelectedModelForInstructions(newModel);
        // Reset tone to first available tone for new model
        const modelTones = TONES[newModel] || TONES[MODELS.GEMINI];
        setSelectedToneInstructions(modelTones[0]?.id || 'standard');
    };

    const handleReset = () => {
        setModelInstructions({
            ...modelInstructions,
            [selectedModelForInstructions]: modelInstructions[selectedModelForInstructions]
        });
    };

    if (!isOpen) return null;

    const currentModelTones = TONES[selectedModelForInstructions] || TONES[MODELS.GEMINI];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-semibold">Instructions Settings</h2>
                            <p className="text-sm text-gray-500 mt-1">Configure translation instructions</p>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Model Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                AI Model:
                            </label>
                            <select
                                value={selectedModelForInstructions}
                                onChange={(e) => handleModelChange(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-gray-500"
                            >
                                {AVAILABLE_MODELS.map((model) => (
                                    <option key={model.id} value={model.id}>
                                        {model.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tone Selection */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Translation Tone:
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setShowToneDropdown(!showToneDropdown)}
                                    className="w-full px-4 py-2 text-left border rounded-lg bg-white flex justify-between items-center hover:bg-gray-50"
                                >
                                    <span>
                                        {currentModelTones.find(t => t.id === selectedToneInstructions)?.name || 'Standard'}
                                    </span>
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                                
                                {showToneDropdown && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                                        {currentModelTones.map((tone) => (
                                            <button
                                                key={tone.id}
                                                onClick={() => {
                                                    setSelectedToneInstructions(tone.id);
                                                    setShowToneDropdown(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                                            >
                                                <div className="font-medium">{tone.name}</div>
                                                <div className="text-sm text-gray-500">{tone.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Pre-translation Instructions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pre-translation Instructions:
                            </label>
                            <textarea
                                value={modelInstructions[selectedModelForInstructions]['pre-instruction']}
                                onChange={(e) => setModelInstructions({
                                    ...modelInstructions,
                                    [selectedModelForInstructions]: {
                                        ...modelInstructions[selectedModelForInstructions],
                                        'pre-instruction': e.target.value
                                    }
                                })}
                                className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-gray-500 resize-none"
                            />
                        </div>

                        {/* Tone Instructions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tone-specific Instructions:
                            </label>
                            <textarea
                                value={modelInstructions[selectedModelForInstructions]['tone-instructions'][selectedToneInstructions]}
                                onChange={(e) => setModelInstructions({
                                    ...modelInstructions,
                                    [selectedModelForInstructions]: {
                                        ...modelInstructions[selectedModelForInstructions],
                                        'tone-instructions': {
                                            ...modelInstructions[selectedModelForInstructions]['tone-instructions'],
                                            [selectedToneInstructions]: e.target.value
                                        }
                                    }
                                })}
                                className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-gray-500 resize-none"
                            />
                        </div>

                        {/* Post-translation Instructions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Post-translation Instructions:
                            </label>
                            <textarea
                                value={modelInstructions[selectedModelForInstructions]['post-instruction']}
                                onChange={(e) => setModelInstructions({
                                    ...modelInstructions,
                                    [selectedModelForInstructions]: {
                                        ...modelInstructions[selectedModelForInstructions],
                                        'post-instruction': e.target.value
                                    }
                                })}
                                className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-gray-500 resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-white">
                    <div className="flex justify-end space-x-3">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Reset to Default
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructionsModal;
