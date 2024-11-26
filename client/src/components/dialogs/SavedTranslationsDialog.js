import React, { useState, useEffect } from 'react';
import { X, Folder, Search, Trash2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

const SavedTranslationsDialog = ({ isOpen, onClose, savedTranslations, onSelectSaved, onDeleteSaved, onClearAll }) => {
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
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleClose}
        >
            <div
                className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Saved Translations</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 border-b">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search translations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-3 focus:ring-gray-500"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {savedTranslations.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <Folder className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                            <p>No saved translations yet</p>
                        </div>
                    ) : filteredTranslations.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p>No translations match your search</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTranslations.map((item, index) => (
                                <div
                                    key={index}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors group relative"
                                >
                                    <div className="mb-2 flex justify-between items-start">
                                        <span className="text-sm text-gray-500">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setItemToDelete(index);
                                                setShowConfirmDialog(true);
                                            }}
                                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <div className="text-xs font-medium text-gray-500 mb-1">Original:</div>
                                            <div className="text-sm">{item.inputText}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-medium text-gray-500 mb-1">Translation:</div>
                                            <div className="text-sm">{item.translatedText}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => {
                                                onSelectSaved(item);
                                                onClose();
                                            }}
                                            className="text-sm text-blue-500 hover:text-blue-600"
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
                    <div className="p-4 border-t">
                        <button
                            onClick={() => setShowConfirmDialog(true)}
                            className="text-red-500 hover:text-red-600 text-sm"
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
            />
        </div>
    );
};

export default SavedTranslationsDialog;
