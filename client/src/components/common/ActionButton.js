import React from 'react';
import { ArrowLeftRight, ClipboardCheck, ClipboardCopy, BookmarkIcon, Check } from 'lucide-react';

const ActionButton = ({
    type,
    onClick,
    isActive = false,
    isLoading = false,
    disabled = false,
    onCancel
}) => {
    const getButtonContent = () => {
        switch (type) {
            case 'translate':
                return (
                    <>
                        <ArrowLeftRight className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        <span className="min-w-[60px] sm:min-w-[80px]">
                            {isLoading ? 'Translating...' : 'Translate'}
                        </span>
                    </>
                );
            case 'copy':
                return (
                    <>
                        {isActive ? (
                            <ClipboardCheck className="h-4 w-4 mr-2 text-white" />
                        ) : (
                            <ClipboardCopy className="h-4 w-4 mr-2" />
                        )}
                        <span className="min-w-[40px] sm:min-w-[80px]">
                            {isActive ? 'Copied!' : 'Copy'}
                        </span>
                    </>
                );
            case 'save':
                return (
                    <>
                        {isActive ? (
                            <Check className="h-4 w-4 mr-2" />
                        ) : (
                            <BookmarkIcon className="h-4 w-4 mr-2" />
                        )}
                        <span className="min-w-[40px] sm:min-w-[80px]">
                            {isActive ? 'Saved!' : 'Save'}
                        </span>
                    </>
                );
            default:
                return null;
        }
    };

    const handleClick = () => {
        if (type === 'translate' && isLoading) {
            onCancel?.();
        } else {
            onClick?.();
        }
    };

    return (
        <div className="flex flex-col items-center">
            <button
                onClick={handleClick}
                disabled={disabled && !isLoading}
                className={`
                    px-4 sm:px-6 py-2 rounded-lg flex items-center justify-center
                    w-full sm:w-auto sm:min-w-[140px] md:min-w-[160px] 
                    transition-all duration-300 relative overflow-hidden
                    ${type === 'translate'
                        ? (disabled && !isLoading
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-navy-500 text-white hover:bg-navy-600')
                        : isActive
                            ? 'bg-navy-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }
                `}
            >
                <div className="relative flex items-center justify-center">
                    {getButtonContent()}
                </div>
            </button>

            {/* Cancel instruction */}
            {isLoading && type === 'translate' && (
                <div className="mt-2 text-sm text-gray-600">
                    Tap again to cancel
                </div>
            )}
        </div>
    );
};

export default ActionButton;
