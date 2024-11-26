import React from 'react';
import { X, FileText } from 'lucide-react';
import DialogWrapper from './DialogWrapper';

const RequestLogViewer = ({ isOpen, onClose, requestLog }) => {
    return (
        <DialogWrapper isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Last API Request</h2>
                <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {requestLog ? (
                    <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm font-mono">
                        {JSON.stringify(requestLog, null, 2)}
                    </pre>
                ) : (
                    <div className="text-center text-gray-500 py-8">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No request log available</p>
                    </div>
                )}
            </div>
        </DialogWrapper>
    );
};

export default RequestLogViewer;
