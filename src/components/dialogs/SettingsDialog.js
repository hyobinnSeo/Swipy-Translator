import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Moon, Sun } from 'lucide-react';

const SettingsDialog = ({ isOpen, onClose, maxLength, onMaxLengthChange, isDarkMode, onDarkModeChange }) => {
  const [localMaxLength, setLocalMaxLength] = useState(maxLength);
  const [localDarkMode, setLocalDarkMode] = useState(isDarkMode);

  const handleSave = () => {
    // Convert to number and ensure it's at least 1000
    const newMaxLength = Math.max(1000, parseInt(localMaxLength) || 1000);
    onMaxLengthChange(newMaxLength);
    onDarkModeChange(localDarkMode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
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
          <div className="space-y-6">
            {/* Dark Mode Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dark Mode
              </label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {localDarkMode ? 'Dark theme enabled' : 'Light theme enabled'}
                </span>
                <button
                  onClick={() => setLocalDarkMode(!localDarkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2 ${
                    localDarkMode ? 'bg-navy-500' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={localDarkMode}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                  <span className="sr-only">Toggle dark mode</span>
                </button>
              </div>
            </div>

            {/* Maximum Input Length */}
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-navy-500"
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
    </div>
  );
};

export default SettingsDialog;