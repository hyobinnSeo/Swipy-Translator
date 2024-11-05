import React, { useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';

const DialogWrapper = ({ isOpen, onClose, children, className = '' }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const SettingsDialog = ({ isOpen, onClose, maxLength, onMaxLengthChange }) => {
  const [localMaxLength, setLocalMaxLength] = useState(maxLength);

  const handleSave = () => {
    // Convert to number and ensure it's at least 1000
    const newMaxLength = Math.max(1000, parseInt(localMaxLength) || 1000);
    onMaxLengthChange(newMaxLength);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <DialogWrapper isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Settings</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Input Length
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  min="1000"
                  value={localMaxLength}
                  onChange={(e) => setLocalMaxLength(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Minimum allowed value is 1,000 characters
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-navy-500 text-white rounded-lg hover:bg-navy-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default SettingsDialog;