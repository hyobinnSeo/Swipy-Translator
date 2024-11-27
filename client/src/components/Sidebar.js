import React, { useEffect } from 'react';
import { X, History, BookmarkIcon, Volume2, Settings } from 'lucide-react';

const Sidebar = ({
    isOpen,
    onClose,
    onOpenInstructions,
    onOpenSaved,
    onOpenHistory,
    onOpenVoiceSettings,
    onOpenSettings,
    isFixedSize,
    onToggleFixedSize,
    isParaphraserMode,
    onToggleParaphraserMode,
    darkMode
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-20 
                ${isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <div
                className={`fixed left-0 top-0 h-full w-64 shadow-lg transform 
                transition-transform duration-300 ease-in-out z-30 flex flex-col overflow-hidden
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                ${darkMode ? 'bg-slate-700 text-slate-100' : 'bg-white'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`p-4 border-b flex-shrink-0 ${darkMode ? 'border-slate-700' : ''}`}>
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Menu</h2>
                        <button 
                            onClick={onClose} 
                            className={`${darkMode 
                                ? 'text-slate-400 hover:text-slate-200' 
                                : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                    <div className="space-y-2">
                        {/* Paraphraser Mode Toggle */}
                        <div className="flex items-center justify-between px-4 py-2">
                            <span className="text-sm">Paraphraser Mode</span>
                            <button
                                onClick={onToggleParaphraserMode}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    isParaphraserMode ? (darkMode ? 'bg-navy-800' : 'bg-navy-400') : (darkMode ? 'bg-slate-600' : 'bg-gray-300')
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isParaphraserMode ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>

                        {/* Fixed Size Toggle */}
                        <div className="flex items-center justify-between px-4 py-2">
                            <span className="text-sm">Fixed Size Text Areas</span>
                            <button
                                onClick={onToggleFixedSize}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    isFixedSize ? (darkMode ? 'bg-navy-800' : 'bg-navy-400') : (darkMode ? 'bg-slate-600' : 'bg-gray-300')
                                  }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isFixedSize ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>

                        {/* Menu items */}
                        <button
                            onClick={() => {
                                onOpenHistory();
                                onClose();
                            }}
                            className={`w-full text-left px-4 py-2 rounded-lg flex items-center transition-colors
                                ${darkMode 
                                    ? 'hover:bg-slate-700' 
                                    : 'hover:bg-gray-100'}`}
                        >
                            <History className="h-4 w-4 mr-2" />
                            Translation History
                        </button>

                        <button
                            onClick={() => {
                                onOpenSaved();
                                onClose();
                            }}
                            className={`w-full text-left px-4 py-2 rounded-lg flex items-center transition-colors
                                ${darkMode 
                                    ? 'hover:bg-slate-700' 
                                    : 'hover:bg-gray-100'}`}
                        >
                            <BookmarkIcon className="h-4 w-4 mr-2" />
                            Saved Translations
                        </button>

                        <button
                            onClick={() => {
                                onOpenVoiceSettings();
                                onClose();
                            }}
                            className={`w-full text-left px-4 py-2 rounded-lg flex items-center transition-colors
                                ${darkMode 
                                    ? 'hover:bg-slate-700' 
                                    : 'hover:bg-gray-100'}`}
                        >
                            <Volume2 className="h-4 w-4 mr-2" />
                            Voice Settings
                        </button>

                        <button
                            onClick={() => {
                                onOpenInstructions();
                                onClose();
                            }}
                            className={`w-full text-left px-4 py-2 rounded-lg flex items-center transition-colors
                                ${darkMode 
                                    ? 'hover:bg-slate-700' 
                                    : 'hover:bg-gray-100'}`}
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Instructions
                        </button>

                        <button
                            onClick={() => {
                                onOpenSettings();
                                onClose();
                            }}
                            className={`w-full text-left px-4 py-2 rounded-lg flex items-center transition-colors
                                ${darkMode 
                                    ? 'hover:bg-slate-700' 
                                    : 'hover:bg-gray-100'}`}
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
