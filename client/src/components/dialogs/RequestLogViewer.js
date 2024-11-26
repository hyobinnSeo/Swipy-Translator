import React from 'react';
import { X, FileText } from 'lucide-react';
import DialogWrapper from './DialogWrapper';

const RequestLogViewer = ({ isOpen, onClose, requestLog, darkMode }) => {
    return (
        <DialogWrapper 
            isOpen={isOpen} 
            onClose={onClose} 
            className="w-full max-w-2xl max-h-[80vh] flex flex-col"
            darkMode={darkMode}
        >
            <div className={`p-4 border-b flex items-center justify-between ${
                darkMode ? 'border-slate-700' : ''
            }`}>
                <h2 className={`text-xl font-semibold ${
                    darkMode ? 'text-slate-100' : ''
                }`}>Last API Request</h2>
                <button
                    onClick={onClose}
                    className={`transition-colors ${
                        darkMode 
                            ? 'text-slate-400 hover:text-slate-200' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {requestLog ? (
                    <pre className={`whitespace-pre-wrap p-4 rounded-lg text-sm font-mono ${
                        darkMode 
                            ? 'bg-slate-800/50 text-slate-200' 
                            : 'bg-gray-50'
                    }`}>
                        {JSON.stringify(requestLog, null, 2)}
                    </pre>
                ) : (
                    <div className={`text-center py-8 ${
                        darkMode ? 'text-slate-400' : 'text-gray-500'
                    }`}>
                        <FileText className={`h-12 w-12 mx-auto mb-3 ${
                            darkMode ? 'text-slate-500' : 'text-gray-400'
                        }`} />
                        <p>No request log available</p>
                    </div>
                )}
            </div>
        </DialogWrapper>
    );
};

export default RequestLogViewer;
