import React, { useState, useRef, useEffect } from 'react';
import { Settings, ChevronDown } from 'lucide-react';
import { TONES, MODELS } from '../constants';

const ToneSelector = ({ selectedTone, onToneChange, selectedModel }) => {
    const [showToneSelector, setShowToneSelector] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setShowToneSelector(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get the tone list for the selected model
    const modelTones = TONES[selectedModel] || TONES[MODELS.GEMINI];

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setShowToneSelector(!showToneSelector)}
                className="flex items-center gap-2 px-2 py-2 text-gray-600 hover:text-gray-800 
                   hover:bg-gray-50 rounded-lg transition-colors"
            >
                <Settings className="w-4 h-4" />
                <span>Tone: {modelTones.find(t => t.id === selectedTone)?.name}</span>
                <ChevronDown className="w-4 h-4" />
            </button>

            {showToneSelector && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50">
                    {modelTones.map((tone) => (
                        <button
                            key={tone.id}
                            onClick={() => {
                                onToneChange(tone.id);
                                setShowToneSelector(false);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${selectedTone === tone.id ? 'bg-gray-50' : ''
                                }`}
                        >
                            <div className="font-medium">{tone.name}</div>
                            <div className="text-sm text-gray-500">{tone.description}</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ToneSelector;
