import React, { useState } from 'react';
import { X, Settings as SettingsIcon, Eye, EyeOff } from 'lucide-react';

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
        className={`bg-white rounded-lg shadow-xl ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const APIKeyField = ({ label, value, onChange, placeholder }) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={showKey ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded-lg focus:ring-3 focus:ring-blue-500 pr-10 bg-white"
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">
    {children}
  </h3>
);

const SettingsDialog = ({ 
  isOpen, 
  onClose, 
  maxLength, 
  onMaxLengthChange, 
  saveHistory, 
  onSaveHistoryChange,
  apiKeys = {},
  onApiKeysChange
}) => {
  const [localMaxLength, setLocalMaxLength] = useState(maxLength);
  const [localSaveHistory, setLocalSaveHistory] = useState(saveHistory);
  const [localApiKeys, setLocalApiKeys] = useState({
    gemini: apiKeys.gemini || '',
    openrouter: apiKeys.openrouter || '',
    openai: apiKeys.openai || ''
  });

  const handleSave = () => {
    const newMaxLength = Math.max(1000, parseInt(localMaxLength) || 1000);
    onMaxLengthChange(newMaxLength);
    onSaveHistoryChange(localSaveHistory);
    onApiKeysChange(localApiKeys);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <DialogWrapper isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gray-50">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* General Settings Section */}
          <div>
            <SectionTitle>General Settings</SectionTitle>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Input Length
                </label>
                <div>
                  <input
                    type="number"
                    min="1000"
                    value={localMaxLength}
                    onChange={(e) => setLocalMaxLength(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-3 focus:ring-blue-500 bg-white"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Minimum allowed value is 1,000 characters
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Save Translation History</label>
                  <button
                    onClick={() => setLocalSaveHistory(!localSaveHistory)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSaveHistory ? 'bg-navy-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSaveHistory ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  When disabled, your translation history will not be saved between sessions
                </p>
              </div>
            </div>
          </div>

          {/* API Keys Section */}
          <div>
            <SectionTitle>API Keys</SectionTitle>
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <APIKeyField
                label="Gemini API Key"
                value={localApiKeys.gemini}
                onChange={(value) => setLocalApiKeys(prev => ({ ...prev, gemini: value }))}
                placeholder="Enter your Gemini API key"
              />
              <APIKeyField
                label="OpenRouter API Key"
                value={localApiKeys.openrouter}
                onChange={(value) => setLocalApiKeys(prev => ({ ...prev, openrouter: value }))}
                placeholder="Enter your OpenRouter API key"
              />
              <APIKeyField
                label="OpenAI API Key"
                value={localApiKeys.openai}
                onChange={(value) => setLocalApiKeys(prev => ({ ...prev, openai: value }))}
                placeholder="Enter your OpenAI API key"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-navy-500 text-white rounded-lg hover:bg-navy-600 shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default SettingsDialog;