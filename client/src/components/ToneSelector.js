import React, { useState, useRef, useEffect } from 'react';
import { Settings, ChevronDown } from 'lucide-react';
import { TONES, MODELS } from '../constants';

const ToneSelector = ({ selectedTone, onToneChange, selectedModel, darkMode }) => {
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
                className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors ${
                    darkMode
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 bg-white'
                }`}
            >
                <Settings className="w-4 h-4" />
                <span>Tone: {modelTones.find(t => t.id === selectedTone)?.name}</span>
                <ChevronDown className="w-4 h-4" />
            </button>

            {showToneSelector && (
                <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50 ${
                    darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-200'
                }`}>
                    {modelTones.map((tone) => (
                        <button
                            key={tone.id}
                            onClick={() => {
                                onToneChange(tone.id);
                                setShowToneSelector(false);
                            }}
                            className={`w-full px-4 py-2 text-left ${
                                darkMode
                                    ? `${selectedTone === tone.id ? 'bg-gray-600' : ''} 
                                       hover:bg-gray-600 text-gray-100`
                                    : `${selectedTone === tone.id ? 'bg-gray-50' : ''} 
                                       hover:bg-gray-50 text-gray-800`
                            }`}
                        >
                            <div className="font-medium">{tone.name}</div>
                            <div className={`text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                                {tone.description}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ToneSelector;
