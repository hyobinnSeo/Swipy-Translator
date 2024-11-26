import React, { useState, useEffect } from 'react';
import { X, Folder, Search, Trash2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

const SavedTranslationsDialog = ({ isOpen, onClose, savedTranslations, onSelectSaved, onDeleteSaved, onClearAll, darkMode }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Reset search when dialog is opened
    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClose = () => {
        setSearchTerm('');
        setShowConfirmDialog(false);
        setItemToDelete(null);
        onClose();
    };

    const filteredTranslations = savedTranslations.filter(item =>
        item.inputText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.translatedText.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div
                className={`rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col ${
                    darkMode ? 'bg-slate-800' : 'bg-white'
                }`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`p-4 border-b flex items-center justify-between ${
                    darkMode ? 'border-slate-700' : ''
                }`}>
                    <h2 className={`text-xl font-semibold ${
                        darkMode ? 'text-slate-100' : ''
                    }`}>Saved Translations</h2>
                    <button
                        onClick={handleClose}
                        className={`transition-colors ${
                            darkMode 
                                ? 'text-slate-400 hover:text-slate-200' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : ''}`}>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search translations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg focus:ring-3 ${
                                darkMode 
                                    ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:ring-blue-500/30' 
                                    : 'border focus:ring-gray-500'
                            }`}
                        />
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${
                            darkMode ? 'text-slate-400' : 'text-gray-400'
                        }`} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {savedTranslations.length === 0 ? (
                        <div className={`text-center py-8 ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}>
                            <Folder className={`h-12 w-12 mx-auto mb-3 ${
                                darkMode ? 'text-slate-500' : 'text-gray-400'
                            }`} />
                            <p>No saved translations yet</p>
                        </div>
                    ) : filteredTranslations.length === 0 ? (
                        <div className={`text-center py-8 ${
                            darkMode ? 'text-slate-400' : 'text-gray-500'
                        }`}>
                            <p>No translations match your search</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTranslations.map((item, index) => (
                                <div
                                    key={index}
                                    className={`rounded-lg p-4 transition-colors group relative ${
                                        darkMode 
                                            ? 'border-slate-700 border hover:bg-slate-700/50' 
                                            : 'border hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="mb-2 flex justify-between items-start">
                                        <span className={
                                            darkMode ? 'text-sm text-slate-400' : 'text-sm text-gray-500'
                                        }>
                                            {new Date(item.timestamp).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setItemToDelete(index);
                                                setShowConfirmDialog(true);
                                            }}
                                            className={`opacity-0 group-hover:opacity-100 transition-opacity ${
                                                darkMode 
                                                    ? 'text-slate-400 hover:text-red-400' 
                                                    : 'text-gray-400 hover:text-red-500'
                                            }`}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <div className={`text-xs font-medium mb-1 ${
                                                darkMode ? 'text-slate-400' : 'text-gray-500'
                                            }`}>Original:</div>
                                            <div className={`text-sm ${
                                                darkMode ? 'text-slate-200' : ''
                                            }`}>{item.inputText}</div>
                                        </div>
                                        <div>
                                            <div className={`text-xs font-medium mb-1 ${
                                                darkMode ? 'text-slate-400' : 'text-gray-500'
                                            }`}>Translation:</div>
                                            <div className={`text-sm ${
                                                darkMode ? 'text-slate-200' : ''
                                            }`}>{item.translatedText}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => {
                                                onSelectSaved(item);
                                                onClose();
                                            }}
                                            className={`text-sm ${
                                                darkMode 
                                                    ? 'text-navy-300 hover:text-navy-400' 
                                                    : 'text-navy-400 hover:text-navy-500'
                                            }`}
                                        >
                                            Load translation
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {savedTranslations.length > 0 && (
                    <div className={`p-4 border-t ${darkMode ? 'border-slate-700' : ''}`}>
                        <button
                            onClick={() => setShowConfirmDialog(true)}
                            className={`text-sm ${
                                darkMode 
                                    ? 'text-red-400 hover:text-red-300' 
                                    : 'text-red-500 hover:text-red-600'
                            }`}
                        >
                            Clear all saved translations
                        </button>
                    </div>
                )}
            </div>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => {
                    setShowConfirmDialog(false);
                    setItemToDelete(null);
                }}
                onConfirm={() => {
                    if (itemToDelete !== null) {
                        onDeleteSaved(itemToDelete);
                    } else {
                        onClearAll();
                    }
                }}
                title={itemToDelete !== null ? "Delete Translation" : "Clear All Translations"}
                message={
                    itemToDelete !== null
                        ? "Are you sure you want to delete this translation?"
                        : "Are you sure you want to clear all saved translations? This action cannot be undone."
                }
                darkMode={darkMode}
            />
        </div>
    );
};

export default SavedTranslationsDialog;
