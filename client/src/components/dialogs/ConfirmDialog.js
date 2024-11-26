import React from 'react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, darkMode }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg max-w-md w-full p-6 ${
                darkMode ? 'bg-slate-800 text-slate-100' : 'bg-white'
            }`}>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className={`mb-6 ${
                    darkMode ? 'text-slate-300' : 'text-gray-600'
                }`}>{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg border transition-colors ${
                            darkMode 
                                ? 'border-slate-600 hover:bg-slate-700 text-slate-300' 
                                : 'border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-4 py-2 rounded-lg text-white transition-colors ${
                            darkMode 
                                ? 'bg-red-900 hover:bg-red-800' 
                                : 'bg-red-500 hover:bg-red-600'
                        }`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
