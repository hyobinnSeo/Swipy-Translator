import React, { useState, useCallback, useEffect } from 'react';
import { ArrowRightLeft, X, Clipboard, ClipboardCheck, ClipboardCopy, MenuIcon, Settings, Volume2, History } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Constants
const MODELS = {
  GEMINI: 'gemini',
  EURYALE: 'euryale',
  COMMAND: 'command'
};

const DEFAULT_INSTRUCTIONS = {
  [MODELS.GEMINI]: {
    pre: `As an English translator, please translate the following Korean text. Your translation should be accurate and natural-sounding. Please provide three different versions.`,
    post: `MAIN:\nALT1:\nALT2:`
  },
  [MODELS.EURYALE]: {
    pre: `Hey! Help me translate this Korean text into casual, everyday English. Keep it natural and conversational - like how people really talk! I'd love to see three different ways to say this.`,
    post: `Best version:\nAnother way to say it:\nOne more option:`
  },
  [MODELS.COMMAND]: {
    pre: `Ready to make this Korean text shine in English! Give it some flair and personality - make it memorable. Show me three creative takes on this.`,
    post: `Hot take:\nRemixed:\nWild card:`
  }
};

const AVAILABLE_MODELS = [
  { id: MODELS.GEMINI, name: 'Gemini 1.5', api: 'google' },
  { id: MODELS.EURYALE, name: 'Llama 3.1 Euryale 70B', api: 'openrouter' },
  { id: MODELS.COMMAND, name: 'Cohere Command R', api: 'openrouter' }
];

// History Management
const MAX_HISTORY_ITEMS = 10;

const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem('translationHistory')) || [];
  } catch {
    return [];
  }
};

const saveHistory = (history) => {
  localStorage.setItem('translationHistory', JSON.stringify(history));
};

// Components
const Alert = ({ children }) => (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
    <span className="block sm:inline">{children}</span>
  </div>
);

const TextArea = ({ 
  value, 
  onChange, 
  placeholder, 
  readOnly = false, 
  className = '', 
  onPaste,
  showSpeaker = false,
  maxLength = 5000 
}) => {
  const textareaRef = React.useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="relative flex-1" style={{ minWidth: 0 }}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= maxLength) {
              onChange(e);
            }
          }}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`w-full min-h-[12rem] p-4 text-lg resize-none mt-4 border rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
            ${readOnly ? 'bg-gray-50' : ''} ${className}`}
        />
        <div className="absolute bottom-2 right-2 text-sm text-gray-500 bg-white px-1">
          {value.length}{!readOnly && `/${maxLength}`}
        </div>
      </div>
      {!value && onPaste && (
        <button
          className="absolute top-8 right-4 px-3 py-1 text-sm text-gray-500 
            hover:text-gray-700 flex items-center transition-colors"
          onClick={onPaste}
        >
          <Clipboard className="h-4 w-4 mr-2" />
          Paste
        </button>
      )}
      {showSpeaker && value && (
        <div className="flex justify-end mt-2">
          <button
            onClick={() => {
              const utterance = new SpeechSynthesisUtterance(value);
              utterance.lang = 'en-US';
              window.speechSynthesis.speak(utterance);
            }}
            className="text-gray-500 hover:text-gray-700"
            title="Text-to-speech"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ isOpen, onClose, onOpenInstructions }) => (
  <>
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-20 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    />
    <div 
      className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform 
        transition-transform z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col`}
    >
      {/* Header - fixed at top */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Menu</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Menu items - scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          <button
            onClick={onOpenInstructions}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Instructions
          </button>
          
          {/* Example additional menu items */}
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            Text-to-Speech Settings
          </button>
          
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Translation Settings
          </button>
          
          <button className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center">
            <ClipboardCopy className="h-4 w-4 mr-2" />
            Copy Settings
          </button>
        </div>
      </div>
    </div>
  </>
);

const HistoryPanel = ({ isOpen, onClose, history, onSelectHistory }) => (
  <>
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity z-20 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    />
    <div 
      className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform 
        transition-transform z-30 ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col`} // Added flex flex-col
    >
      {/* Header - fixed at top */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Translation History</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* History items - scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {history.map((item, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelectHistory(item)}
            >
              <div className="text-sm font-medium text-gray-600 mb-1">
                {new Date(item.timestamp).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 truncate">{item.inputText}</div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              No translation history yet
            </div>
          )}
        </div>
      </div>
    </div>
  </>
);

const InstructionsModal = ({ isOpen, onClose, modelInstructions, selectedModel, setModelInstructions }) => {
  if (!isOpen) return null;

  const handleReset = () => {
    setModelInstructions({
      ...modelInstructions,
      [selectedModel]: DEFAULT_INSTRUCTIONS[selectedModel]
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Instructions Settings</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pre-translation Instructions:
              </label>
              <textarea
                value={modelInstructions[selectedModel].pre}
                onChange={(e) => setModelInstructions({
                  ...modelInstructions,
                  [selectedModel]: {
                    ...modelInstructions[selectedModel],
                    pre: e.target.value
                  }
                })}
                className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Post-translation Requirements:
              </label>
              <textarea
                value={modelInstructions[selectedModel].post}
                onChange={(e) => setModelInstructions({
                  ...modelInstructions,
                  [selectedModel]: {
                    ...modelInstructions[selectedModel],
                    post: e.target.value
                  }
                })}
                className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-blue-500 hover:text-blue-600"
            >
              Reset to Default
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TranslatorApp = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS.GEMINI);
  const [modelInstructions, setModelInstructions] = useState(DEFAULT_INSTRUCTIONS);
  const [characterCount, setCharacterCount] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const translateWithOpenRouter = useCallback(async (text, modelId) => {
    const modelUrl = modelId === MODELS.EURYALE 
      ? 'sao10k/l3.1-euryale-70b'
      : 'cohere/command-r-08-2024';
      
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Translator App'
        },
        body: JSON.stringify({
          model: modelUrl,
          messages: [
            { role: "system", content: modelInstructions[modelId].pre },
            { role: "user", content: text },
            { role: "system", content: modelInstructions[modelId].post }
          ]
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return data.choices[0]?.message?.content;
    } catch (error) {
      throw new Error(error.message === 'Unauthorized' 
        ? 'Invalid API key. Please check your environment variables.'
        : `Translation error: ${error.message}`);
    }
  }, [modelInstructions]);

  const translateWithGemini = useCallback(async (text) => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        modelInstructions[selectedModel].pre,
        `Input Text: ${text}`,
        modelInstructions[selectedModel].post
      ].join('\n\n'));
      return result.response.text();
    } catch (error) {
      throw new Error(error.message.includes('API key') 
        ? 'Invalid Gemini API key. Please check your environment variables.'
        : `Translation error: ${error.message}`);
    }
  }, [modelInstructions, selectedModel]);

  const handleTranslate = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      let translatedResult;
      if (selectedModel === MODELS.GEMINI) {
        translatedResult = await translateWithGemini(inputText);
      } else {
        translatedResult = await translateWithOpenRouter(inputText, selectedModel);
      }
      
      if (!translatedResult) throw new Error('No translation result.');
      setTranslatedText(translatedResult);

      // Add to history
      const newHistory = [
        {
          inputText,
          translatedText: translatedResult,
          model: selectedModel,
          timestamp: new Date().toISOString()
        },
        ...history
      ].slice(0, MAX_HISTORY_ITEMS);
      
      setHistory(newHistory);
      saveHistory(newHistory);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setCopySuccess(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenInstructions={() => {
          setIsInstructionsOpen(true);
          setIsSidebarOpen(false);
        }}
      />

      <HistoryPanel 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistory={(item) => {
          setInputText(item.inputText);
          setTranslatedText(item.translatedText);
          setSelectedModel(item.model);
          setIsHistoryOpen(false);
        }}
      />

      <InstructionsModal 
        isOpen={isInstructionsOpen}
        onClose={() => setIsInstructionsOpen(false)}
        modelInstructions={modelInstructions}
        selectedModel={selectedModel}
        setModelInstructions={setModelInstructions}
      />

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
                title="Menu"
              >
                <MenuIcon className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="text-gray-600 hover:text-gray-800 transition-colors"
                title="Translation History"
              >
                <History className="h-6 w-6" />
              </button>
            </div>

            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setTranslatedText('');
              }}
              className="w-[200px] p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              {AVAILABLE_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <TextArea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setCharacterCount(e.target.value.length);
              }}
              placeholder="Enter text to translate..."
              showSpeaker={true}
              onPaste={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  setInputText(text);
                  setCharacterCount(text.length);
                } catch (err) {
                  console.error('Failed to read clipboard:', err);
                }
              }}
            />

            <TextArea
              value={translatedText}
              readOnly
              placeholder="Translation will appear here..."
              showSpeaker={true}
            />
          </div>

          {error && <Alert>{error}</Alert>}

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={handleTranslate}
              disabled={!inputText || isLoading}
              className={`px-6 py-2 rounded-lg flex items-center ${
                inputText && !isLoading
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ArrowRightLeft className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Translating...' : 'Translate'}
            </button>

            {translatedText && (
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(translatedText);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  } catch (err) {
                    console.error('Failed to copy text:', err);
                  }
                }}
                className="px-6 py-2 rounded-lg flex items-center bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {copySuccess ? (
                  <>
                    <ClipboardCheck className="mr-2 h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => {
                setInputText('');
                setTranslatedText('');
                setCopySuccess(false);
                setError('');
                setCharacterCount(0);
              }}
              disabled={!inputText && !translatedText}
              className={`px-6 py-2 rounded-lg flex items-center border transition-colors ${
                inputText || translatedText
                  ? 'border-gray-300 hover:bg-gray-100'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslatorApp;