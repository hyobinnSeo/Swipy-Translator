import React, { useState, useEffect } from 'react';
import { X, Settings as SettingsIcon, Eye, EyeOff, Moon, Volume2 } from 'lucide-react';
import DialogWrapper from './DialogWrapper';

const APIKeyField = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  darkMode, 
  showVerify = false,
  onVerify,
  verificationStatus,
  verificationMessage,
  verifying,
  disabled = false
}) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="space-y-1">
      <label className={`block text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>
        {label}
      </label>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <input
            type={showKey ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full px-3 py-2 rounded-lg focus:ring-3 pr-10 ${
              darkMode
                ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-500/30 placeholder-slate-400'
                : 'bg-white border focus:ring-blue-500'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            disabled={disabled}
            className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
              darkMode
                ? 'text-slate-400 hover:text-slate-300'
                : 'text-gray-400 hover:text-gray-600'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {showVerify && onVerify && (
          <button
            onClick={onVerify}
            disabled={!value || verifying || disabled}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            } ${(!value || verifying || disabled) && 'opacity-50 cursor-not-allowed'}`}
          >
            {verifying ? 'Verifying...' : 'Verify'}
          </button>
        )}
      </div>
      {verificationStatus && (
        <p className={`text-sm mt-1 ${
          verificationStatus === 'valid' 
            ? 'text-green-500' 
            : 'text-red-500'
        }`}>
          {verificationMessage || (verificationStatus === 'valid' 
            ? 'API key is valid' 
            : 'Invalid API key')}
        </p>
      )}
    </div>
  );
};

const SectionTitle = ({ children, darkMode }) => (
  <h3 className={`text-sm font-semibold border-b pb-2 mb-4 ${
    darkMode ? 'text-slate-200 border-slate-700' : 'text-gray-900'
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
  onPreviewDarkModeChange,
  apiKeys = {},
  onApiKeysChange
}) => {
  const [localMaxLength, setLocalMaxLength] = useState(maxLength);
  const [localSaveHistory, setLocalSaveHistory] = useState(saveHistory);
  const [previewDarkMode, setPreviewDarkMode] = useState(darkMode);
  // Saved value captured when the dialog opens, used to revert a cancelled preview
  const [originalDarkMode, setOriginalDarkMode] = useState(darkMode);
  const [useGoogleTTS, setUseGoogleTTS] = useState(localStorage.getItem('useGoogleCloudTTS') === 'true');
  const [verifying, setVerifying] = useState({
    gemini: false,
    openrouter: false,
    openai: false,
    anthropic: false
  });
  const [verificationStatus, setVerificationStatus] = useState({
    gemini: null,
    openrouter: null,
    openai: null,
    anthropic: null
  });
  const [verificationMessage, setVerificationMessage] = useState({
    gemini: null,
    openrouter: null,
    openai: null,
    anthropic: null
  });
  const [localApiKeys, setLocalApiKeys] = useState({
    gemini: apiKeys.gemini || '',
    openrouter: apiKeys.openrouter || '',
    openai: apiKeys.openai || '',
    anthropic: apiKeys.anthropic || ''
  });

  const verifyApiKey = async (service) => {
    setVerifying(prev => ({ ...prev, [service]: true }));
    setVerificationStatus(prev => ({ ...prev, [service]: null }));
    setVerificationMessage(prev => ({ ...prev, [service]: null }));

    try {
      let response;
      switch (service) {
        case 'gemini':
          response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash?key=${localApiKeys.gemini}`
          );
          break;
        case 'openrouter':
          response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localApiKeys.openrouter}`,
              'HTTP-Referer': window.location.origin,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: "openai/gpt-3.5-turbo",
              messages: [{ role: "user", content: "test" }]
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Invalid API key');
          }
          break;
        case 'openai':
          response = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${localApiKeys.openai}`
            }
          });
          break;
        case 'anthropic':
          response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': localApiKeys.anthropic,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 1,
              messages: [{ role: 'user', content: 'test' }]
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Invalid API key');
          }
          break;
      }

      if (!response.ok) {
        throw new Error('Invalid API key');
      }

      setVerificationStatus(prev => ({ ...prev, [service]: 'valid' }));
      setVerificationMessage(prev => ({ ...prev, [service]: 'API key is valid' }));
    } catch (error) {
      console.error(`${service} validation error:`, error);
      setVerificationStatus(prev => ({ ...prev, [service]: 'invalid' }));
      setVerificationMessage(prev => ({ ...prev, [service]: error.message }));
    } finally {
      setVerifying(prev => ({ ...prev, [service]: false }));
    }
  };

  useEffect(() => {
    if (isOpen) {
      setPreviewDarkMode(darkMode);
      setOriginalDarkMode(darkMode);
      setVerificationStatus({
        gemini: null,
        openrouter: null,
        openai: null,
        anthropic: null
      });
      setVerificationMessage({
        gemini: null,
        openrouter: null,
        openai: null,
        anthropic: null
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Live-preview dark mode across the whole app while the dialog is open
  const handleToggleDarkMode = () => {
    const next = !previewDarkMode;
    setPreviewDarkMode(next);
    if (onPreviewDarkModeChange) {
      onPreviewDarkModeChange(next);
    }
  };

  const handleSave = () => {
    const newMaxLength = Math.max(1000, parseInt(localMaxLength) || 1000);
    onMaxLengthChange(newMaxLength);
    onSaveHistoryChange(localSaveHistory);
    onDarkModeChange(previewDarkMode);
    
    // Save API keys to localStorage
    localStorage.setItem('apiKeys', JSON.stringify(localApiKeys));
    localStorage.setItem('useGoogleCloudTTS', useGoogleTTS.toString());
    
    // Call the parent's onApiKeysChange
    onApiKeysChange(localApiKeys);
    onClose();
  };

  const handleCancel = () => {
    // Revert any live dark-mode preview back to the saved value
    if (onPreviewDarkModeChange) {
      onPreviewDarkModeChange(originalDarkMode);
    }
    onClose();
  };

  return (
    <DialogWrapper isOpen={isOpen} onClose={handleCancel} darkMode={previewDarkMode}>
      <div className="w-full max-w-md flex flex-col h-full">
        <div className={`shrink-0 px-6 py-4 border-b flex items-center justify-between ${
          previewDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50'
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
                    onClick={handleToggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      previewDarkMode ? 'bg-navy-900' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        previewDarkMode ? 'translate-x-6' : 'translate-x-1'
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSaveHistory ? (previewDarkMode ? 'bg-navy-900' : 'bg-navy-400') : (previewDarkMode ? 'bg-slate-600' : 'bg-gray-300')
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSaveHistory ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className={`text-sm ${previewDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  When disabled, your translation history will not be saved between sessions
                </p>
              </div>

              <div className={`p-4 rounded-lg ${previewDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <label className={`block text-sm font-medium mb-2 ${
                  previewDarkMode ? 'text-slate-300' : 'text-gray-700'
                }`}>
                  Maximum Input Length
                </label>
                <div>
                  <input
                    type="number"
                    min="1000"
                    value={localMaxLength}
                    onChange={(e) => setLocalMaxLength(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg focus:ring-3 ${
                      previewDarkMode
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
                showVerify={true}
                onVerify={() => verifyApiKey('gemini')}
                verificationStatus={verificationStatus.gemini}
                verificationMessage={verificationMessage.gemini}
                verifying={verifying.gemini}
              />
              <APIKeyField
                label="OpenRouter API Key"
                value={localApiKeys.openrouter}
                onChange={(value) => setLocalApiKeys(prev => ({ ...prev, openrouter: value }))}
                placeholder="Enter your OpenRouter API key"
                darkMode={previewDarkMode}
                showVerify={true}
                onVerify={() => verifyApiKey('openrouter')}
                verificationStatus={verificationStatus.openrouter}
                verificationMessage={verificationMessage.openrouter}
                verifying={verifying.openrouter}
              />
              <APIKeyField
                label="OpenAI API Key"
                value={localApiKeys.openai}
                onChange={(value) => setLocalApiKeys(prev => ({ ...prev, openai: value }))}
                placeholder="Enter your OpenAI API key"
                darkMode={previewDarkMode}
                showVerify={true}
                onVerify={() => verifyApiKey('openai')}
                verificationStatus={verificationStatus.openai}
                verificationMessage={verificationMessage.openai}
                verifying={verifying.openai}
              />
              <APIKeyField
                label="Anthropic API Key"
                value={localApiKeys.anthropic}
                onChange={(value) => setLocalApiKeys(prev => ({ ...prev, anthropic: value }))}
                placeholder="Enter your Anthropic API key"
                darkMode={previewDarkMode}
                showVerify={true}
                onVerify={() => verifyApiKey('anthropic')}
                verificationStatus={verificationStatus.anthropic}
                verificationMessage={verificationMessage.anthropic}
                verifying={verifying.anthropic}
              />
            </div>
          </div>

          {/* Text-to-Speech Section */}
          <div>
            <SectionTitle darkMode={previewDarkMode}>Text-to-Speech</SectionTitle>
            <div className={`space-y-4 p-4 rounded-lg ${previewDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Volume2 className={`h-4 w-4 ${previewDarkMode ? 'text-slate-400' : 'text-gray-600'}`} />
                  <label className={`text-sm font-medium ${previewDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Use Gemini TTS
                  </label>
                </div>
                <button
                  onClick={() => setUseGoogleTTS(!useGoogleTTS)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useGoogleTTS ? (previewDarkMode ? 'bg-navy-900' : 'bg-navy-400') : (previewDarkMode ? 'bg-slate-600' : 'bg-gray-300')
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useGoogleTTS ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className={`text-sm ${previewDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                {useGoogleTTS
                  ? "Using Gemini-TTS for higher quality voice output (credentials are configured on the server)"
                  : "Using browser's built-in Text-to-Speech"}
              </p>
            </div>
          </div>
        </div>

        <div className={`shrink-0 px-6 py-4 border-t flex justify-end space-x-3 ${
          previewDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50'
        }`}>
          <button
            onClick={handleCancel}
            className={`px-4 py-2 ${
              previewDarkMode
                ? 'text-slate-300 hover:text-slate-100'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-white rounded-lg shadow-sm ${
              previewDarkMode
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
