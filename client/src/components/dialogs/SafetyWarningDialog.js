import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import DialogWrapper from './DialogWrapper';

const SafetyWarningDialog = ({ isOpen, onClose, darkMode }) => {
    return (
        <DialogWrapper isOpen={isOpen} onClose={onClose} darkMode={darkMode}>
            <div className="max-w-md w-full p-6 relative animate-fade-in">
                <button
                    onClick={onClose}
                    className={`absolute right-4 top-4 rounded-full p-1 transition-colors ${
                        darkMode 
                            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label="Close dialog"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 rounded-full p-2 ${
                        darkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
                    }`}>
                        <AlertTriangle className={`h-6 w-6 ${
                            darkMode ? 'text-yellow-400' : 'text-yellow-500'
                        }`} />
                    </div>

                    <div className="flex-1">
                        <h3 className={`text-lg font-semibold mb-2 ${
                            darkMode ? 'text-slate-100' : 'text-gray-900'
                        }`}>
                            Content Warning
                        </h3>

                        <p className={`mb-4 ${
                            darkMode ? 'text-slate-300' : 'text-gray-600'
                        }`}>
                            The translation request was blocked due to potentially inappropriate content. Please review your text and try again with appropriate content.
                        </p>

                        <div className={`border rounded-lg p-4 mb-4 ${
                            darkMode 
                                ? 'bg-yellow-900/20 border-yellow-900/50' 
                                : 'bg-yellow-50 border-yellow-200'
                        }`}>
                            <div className={`font-medium mb-1 ${
                                darkMode ? 'text-yellow-400' : 'text-yellow-800'
                            }`}>Note</div>
                            <div className={`text-sm ${
                                darkMode ? 'text-yellow-300' : 'text-yellow-700'
                            }`}>
                                Our translation service maintains certain content standards to ensure safe and respectful communication.
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className={`w-full font-medium py-2 px-4 rounded-lg transition-colors ${
                                darkMode 
                                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-100' 
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                            }`}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </DialogWrapper>
    );
};

export default SafetyWarningDialog;
