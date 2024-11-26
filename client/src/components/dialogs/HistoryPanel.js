import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

const HistoryPanel = ({ isOpen, onClose, history, onSelectHistory, onDeleteHistory, onClearHistory }) => {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

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
                className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-20 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div
                className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform 
                transition-transform z-30 ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                flex flex-col overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Translation History</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                    <div className="space-y-4">
                        {history.length > 0 && (
                            <button
                                onClick={() => setShowConfirmDialog(true)}
                                className="w-full px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors mb-4"
                            >
                                Clear All History
                            </button>
                        )}

                        {history.map((item, index) => (
                            <div
                                key={index}
                                className="p-3 border rounded-lg hover:bg-gray-50 relative group"
                            >
                                <div
                                    className="cursor-pointer"
                                    onClick={() => onSelectHistory(item)}
                                >
                                    <div className="text-sm font-medium text-gray-600 mb-1">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500 truncate pr-8">
                                        {item.inputText}
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setItemToDelete(index);
                                        setShowConfirmDialog(true);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 
                                    hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete entry"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        {history.length === 0 && (
                            <div className="text-center text-gray-500 py-4">
                                No translation history yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => {
                    setShowConfirmDialog(false);
                    setItemToDelete(null);
                }}
                onConfirm={() => {
                    if (itemToDelete !== null) {
                        onDeleteHistory(itemToDelete);
                    } else {
                        onClearHistory();
                    }
                }}
                title={itemToDelete !== null ? "Delete Entry" : "Clear Translation History"}
                message={
                    itemToDelete !== null
                        ? "Are you sure you want to delete this translation entry?"
                        : "Are you sure you want to clear all translation history? This action cannot be undone."
                }
            />
        </>
    );
};

export default HistoryPanel;
