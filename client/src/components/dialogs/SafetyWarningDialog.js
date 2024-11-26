import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const SafetyWarningDialog = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 relative animate-fade-in">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 rounded-full p-1 hover:bg-gray-100 transition-colors"
                    aria-label="Close dialog"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 bg-yellow-50 rounded-full p-2">
                        <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Content Warning
                        </h3>

                        <p className="text-gray-600 mb-4">
                            The translation request was blocked due to potentially inappropriate content. Please review your text and try again with appropriate content.
                        </p>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                            <div className="font-medium text-yellow-800 mb-1">Note</div>
                            <div className="text-yellow-700 text-sm">
                                Our translation service maintains certain content standards to ensure safe and respectful communication.
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SafetyWarningDialog;
