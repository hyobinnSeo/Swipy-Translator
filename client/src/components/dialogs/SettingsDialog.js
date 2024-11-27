import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, Eye, EyeOff, Moon } from 'lucide-react';
import DialogWrapper from './DialogWrapper';

const APIKeyField = ({ label, value, onChange, placeholder, darkMode }) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-1">
      <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'
        }`}>
        {label}
      </label>
      <div className="relative">
        <input
          type={showKey ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 rounded-lg focus:ring-3 pr-10 ${darkMode
              ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-500/30 placeholder-slate-400'
              : 'bg-white border focus:ring-blue-500'
            }`}
        />
        <button
          type="button"
          onClick={() => setShowKey(!showKey)}
          className={`absolute inset-y-0 right-0 pr-3 flex items-center ${darkMode
              ? 'text-slate-400 hover:text-slate-300'
              : 'text-gray-400 hover:text-gray-600'
            }`}
        >
          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

const SectionTitle = ({ children, darkMode }) => (
  <h3 className={`text-sm font-semibold border-b pb-2 mb-4 ${darkMode
      ? 'text-slate-200 border-slate-700'
      : 'text-gray-900'
    }`}>
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
  darkMode,
  onDarkModeChange,
  apiKeys = {},
  onApiKeysChange
}) => {
  const [localMaxLength, setLocalMaxLength] = useState(maxLength);
  const [localSaveHistory, setLocalSaveHistory] = useState(saveHistory);
  const [localDarkMode, setLocalDarkMode] = useState(darkMode);
  const [previewDarkMode, setPreviewDarkMode] = useState(darkMode);
  const [localApiKeys, setLocalApiKeys] = useState({
    gemini: apiKeys.gemini || '',
    openrouter: apiKeys.openrouter || '',
    openai: apiKeys.openai || '',
    googleCloud: {
      projectId: apiKeys.googleCloud?.projectId || '',
      privateKey: apiKeys.googleCloud?.privateKey || '',
      clientEmail: apiKeys.googleCloud?.clientEmail || ''
    }
  });

  // Reset local state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setLocalDarkMode(darkMode);
      setPreviewDarkMode(darkMode);
    }
  }, [isOpen, darkMode]);

  // Apply preview dark mode
  useEffect(() => {
    if (isOpen) {
      if (previewDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [previewDarkMode, isOpen]);

  const handleSave = () => {
    const newMaxLength = Math.max(1000, parseInt(localMaxLength) || 1000);
    onMaxLengthChange(newMaxLength);
    onSaveHistoryChange(localSaveHistory);
    onDarkModeChange(previewDarkMode);
    onApiKeysChange(localApiKeys);
    onClose();
  };

  const handleCancel = () => {
    // Revert dark mode to original state
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    onClose();
  };

  return (
    <DialogWrapper isOpen={isOpen} onClose={handleCancel} darkMode={previewDarkMode}>
      <div className="w-full max-w-md flex flex-col h-full">
        <div className={`shrink-0 px-6 py-4 border-b flex items-center justify-between ${previewDarkMode
            ? 'bg-slate-800 border-slate-700'
            : 'bg-gray-50'
          }`}>
          <div className="flex items-center space-x-2">
            <SettingsIcon className={`w-5 h-5 ${previewDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />
            <h2 className={`text-lg font-semibold ${previewDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>Settings</h2>
          </div>
          <button
            onClick={handleCancel}
            className={previewDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* General Settings Section */}
          <div>
            <SectionTitle darkMode={previewDarkMode}>General Settings</SectionTitle>
            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${previewDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Moon className={`h-4 w-4 ${previewDarkMode ? 'text-slate-400' : 'text-gray-600'}`} />
                    <label className={`text-sm font-medium ${previewDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Dark Mode
                    </label>
                  </div>
                  <button
                    onClick={() => setPreviewDarkMode(!previewDarkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${previewDarkMode ? 'bg-navy-200' : previewDarkMode ? 'bg-slate-600' : 'bg-gray-200'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${previewDarkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
                <p className={`text-sm ${previewDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  Enable dark mode for a more comfortable viewing experience in low-light conditions
                </p>
              </div>

              <div className={`p-4 rounded-lg ${previewDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className={`text-sm font-medium ${previewDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Save Translation History
                  </label>
                  <button
                    onClick={() => setLocalSaveHistory(!localSaveHistory)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSaveHistory ? 'bg-navy-200' : previewDarkMode ? 'bg-slate-600' : 'bg-gray-200'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSaveHistory ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>
                <p className={`text-sm ${previewDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  When disabled, your translation history will not be saved between sessions
                </p>
              </div>

              <div className={`p-4 rounded-lg ${previewDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <label className={`block text-sm font-medium mb-2 ${previewDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                  Maximum Input Length
                </label>
                <div>
                  <input
                    type="number"
                    min="1000"
                    value={localMaxLength}
                    onChange={(e) => setLocalMaxLength(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg focus:ring-3 ${previewDarkMode
                        ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-500/30'
                        : 'bg-white border focus:ring-blue-500'
                      }`}
                  />
                  <p className={`mt-2 text-sm ${previewDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    Minimum allowed value is 1,000 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* API Keys Section */}
          <div>
            <SectionTitle darkMode={previewDarkMode}>API Keys</SectionTitle>
            <div className={`space-y-4 p-4 rounded-lg ${previewDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <APIKeyField
                label="Gemini API Key"
                value={localApiKeys.gemini}
                onChange={(value) => setLocalApiKeys(prev => ({ ...prev, gemini: value }))}
                placeholder="Enter your Gemini API key"
                darkMode={previewDarkMode}
              />
              <APIKeyField
                label="OpenRouter API Key"
                value={localApiKeys.openrouter}
                onChange={(value) => setLocalApiKeys(prev => ({ ...prev, openrouter: value }))}
                placeholder="Enter your OpenRouter API key"
                darkMode={previewDarkMode}
              />
              <APIKeyField
                label="OpenAI API Key"
                value={localApiKeys.openai}
                onChange={(value) => setLocalApiKeys(prev => ({ ...prev, openai: value }))}
                placeholder="Enter your OpenAI API key"
                darkMode={previewDarkMode}
              />
            </div>
          </div>

          {/* Google Cloud Section */}
          <div>
            <SectionTitle darkMode={previewDarkMode}>Google Cloud Services</SectionTitle>
            <div className={`space-y-4 p-4 rounded-lg ${previewDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <p className={`text-sm mb-4 ${previewDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                These credentials are used for Text-to-Speech services
              </p>
              <APIKeyField
                label="Project ID"
                value={localApiKeys.googleCloud.projectId}
                onChange={(value) => setLocalApiKeys(prev => ({
                  ...prev,
                  googleCloud: { ...prev.googleCloud, projectId: value }
                }))}
                placeholder="Enter your Google Cloud Project ID"
                darkMode={previewDarkMode}
              />
              <APIKeyField
                label="Client Email"
                value={localApiKeys.googleCloud.clientEmail}
                onChange={(value) => setLocalApiKeys(prev => ({
                  ...prev,
                  googleCloud: { ...prev.googleCloud, clientEmail: value }
                }))}
                placeholder="Enter your service account client email"
                darkMode={previewDarkMode}
              />
              <APIKeyField
                label="Private Key"
                value={localApiKeys.googleCloud.privateKey}
                onChange={(value) => setLocalApiKeys(prev => ({
                  ...prev,
                  googleCloud: { ...prev.googleCloud, privateKey: value }
                }))}
                placeholder="Enter your service account private key"
                darkMode={previewDarkMode}
              />
              <p className={`text-sm ${previewDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                These credentials can be found in your Google Cloud service account key file
              </p>
            </div>
          </div>
        </div>

        <div className={`shrink-0 px-6 py-4 border-t flex justify-end space-x-3 ${previewDarkMode
            ? 'bg-slate-800 border-slate-700'
            : 'bg-gray-50'
          }`}>
          <button
            onClick={handleCancel}
            className={`px-4 py-2 ${previewDarkMode
                ? 'text-slate-300 hover:text-slate-100'
                : 'text-gray-600 hover:text-gray-800'
              }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-white rounded-lg shadow-sm ${previewDarkMode
                ? 'bg-navy-400 hover:bg-navy-500'
                : 'bg-navy-500 hover:bg-navy-600'
              }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </DialogWrapper>
  );
};

export default SettingsDialog;
