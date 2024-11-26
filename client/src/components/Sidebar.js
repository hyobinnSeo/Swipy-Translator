import React, { useEffect } from 'react';
import { X, History, BookmarkIcon, Volume2, Settings, FileText } from 'lucide-react';

const Sidebar = ({
    isOpen,
    onClose,
    onOpenInstructions,
    onOpenSaved,
    onOpenRequestLog,
    onOpenHistory,
    onOpenVoiceSettings,
    onOpenSettings,
    isFixedSize,
    onToggleFixedSize
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
                className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform 
                transition-transform duration-300 ease-in-out z-30 flex flex-col overflow-hidden
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Menu</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                    <div className="space-y-2">
                        {/* Add the toggle button for fixed size */}
                        <div className="flex items-center justify-between px-4 py-2">
                            <span className="text-sm">Fixed Size Text Areas</span>
                            <button
                                onClick={onToggleFixedSize}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isFixedSize ? 'bg-navy-500' : 'bg-gray-200'}`}
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
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                        >
                            <History className="h-4 w-4 mr-2" />
                            Translation History
                        </button>

                        <button
                            onClick={() => {
                                onOpenSaved();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                        >
                            <BookmarkIcon className="h-4 w-4 mr-2" />
                            Saved Translations
                        </button>

                        <button
                            onClick={() => {
                                onOpenVoiceSettings();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                        >
                            <Volume2 className="h-4 w-4 mr-2" />
                            Voice Settings
                        </button>

                        <button
                            onClick={() => {
                                onOpenInstructions();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Instructions
                        </button>

                        <button
                            onClick={() => {
                                onOpenRequestLog();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Last API Request
                        </button>

                        <button
                            onClick={() => {
                                onOpenSettings();
                                onClose();
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center transition-colors"
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
