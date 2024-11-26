import React from 'react';

const DialogWrapper = ({ isOpen, onClose, children, className = '' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                ></div>

                {/* Modal */}
                <div className={`relative bg-white rounded-lg shadow-xl ${className}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DialogWrapper;
