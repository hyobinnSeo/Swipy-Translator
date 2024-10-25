import React, { useState } from 'react';
import { ArrowRightLeft, X, Clipboard, ClipboardCheck, ClipboardCopy, Settings } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const TranslatorApp = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini');
  
  // 모델별 프롬프트 설정
  const [modelInstructions, setModelInstructions] = useState({
    gemini: {
      pre: `As an English translator, please translate the following Korean text. Your translation should be accurate and natural-sounding. Please provide three different versions.`,
      post: `MAIN:
ALT1:
ALT2:`
    },
    euryale: {
      pre: `Hey! Help me translate this Korean text into casual, everyday English. Keep it natural and conversational - like how people really talk! I'd love to see three different ways to say this.`,
      post: `Best version:
Another way to say it:
One more option:`
    },
    command: {
      pre: `Ready to make this Korean text shine in English! Give it some flair and personality - make it memorable. Show me three creative takes on this.`,
      post: `Hot take:
Remixed:
Wild card:`
    }
  });

  const models = [
    { id: 'gemini', name: 'Gemini 1.5', api: 'google' },
    { id: 'euryale', name: 'Llama 3.1 Euryale 70B', api: 'openrouter' },
    { id: 'command', name: 'Cohere Command R', api: 'openrouter' }
  ];

  const translateWithOpenRouter = async (text, modelId) => {
    // OpenRouter의 정확한 모델 ID 사용
    const modelUrl = modelId === 'euryale' 
      ? 'sao10k/l3.1-euryale-70b'  // Euryale 모델
      : 'cohere/command-r-08-2024';  // Cohere Command R 모델
      
    try {
      console.log('Using model:', modelUrl); // 디버깅용 로그
      console.log('Prompts:', {
        pre: modelInstructions[modelId].pre,
        post: modelInstructions[modelId].post
      }); // 디버깅용 로그

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

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Details:', errorData);
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Unexpected API response format');
      }

      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter API Error:', error);
      throw new Error(
        error.message === 'Unauthorized' 
          ? 'API 키가 유효하지 않습니다. 환경 변수를 확인해주세요.'
          : `번역 중 오류가 발생했습니다: ${error.message}`
      );
    }
  };

  const translateWithGemini = async (text) => {
    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `${modelInstructions[selectedModel].pre}
        
        Input Text:
        ${text}

        ===

        ${modelInstructions[selectedModel].post}`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(
        error.message.includes('API key') 
          ? 'Gemini API 키가 유효하지 않습니다. 환경 변수를 확인해주세요.'
          : `번역 중 오류가 발생했습니다: ${error.message}`
      );
    }
  };

  const handleTranslate = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      let translatedResult;
      if (selectedModel === 'gemini') {
        translatedResult = await translateWithGemini(inputText);
      } else {
        translatedResult = await translateWithOpenRouter(inputText, selectedModel);
      }
      
      if (!translatedResult) {
        throw new Error('번역 결과가 없습니다.');
      }
      
      setTranslatedText(translatedResult);
    } catch (err) {
      console.error('Translation error:', err);
      setError(err.message || '번역에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
      setCopySuccess(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
    setCopySuccess(false);
    setError('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    setTranslatedText(''); // Clear previous translation when model changes
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center text-gray-600 hover:text-gray-800 text-sm sm:text-base"
            >
              <Settings className="h-4 w-4 mr-1 sm:mr-2" />
              {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
            </button>

            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="w-[180px] sm:w-[200px] text-sm sm:text-base p-1.5 sm:p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {showInstructions && (
            <div className="mb-6 space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pre-translation Instructions:
                </label>
                <input
                  type="text"
                  value={modelInstructions[selectedModel].pre}
                  onChange={(e) => setModelInstructions({
                    ...modelInstructions,
                    [selectedModel]: {
                      ...modelInstructions[selectedModel],
                      pre: e.target.value
                    }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post-translation Requirements:
                </label>
                <input
                  type="text"
                  value={modelInstructions[selectedModel].post}
                  onChange={(e) => setModelInstructions({
                    ...modelInstructions,
                    [selectedModel]: {
                      ...modelInstructions[selectedModel],
                      post: e.target.value
                    }
                  })}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="flex-1 relative">
              <textarea
                placeholder="Enter text to translate..."
                className="w-full h-48 p-3 sm:p-4 text-base sm:text-lg resize-none mt-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              {!inputText && (
                <button
                  className="absolute top-8 right-4 px-2 sm:px-3 py-1 text-sm text-gray-500 hover:text-gray-700 flex items-center"
                  onClick={handlePaste}
                >
                  <Clipboard className="h-4 w-4 mr-1 sm:mr-2" />
                  Paste
                </button>
              )}
            </div>

            <div className="flex-1">
              <textarea
                readOnly
                placeholder="Translation will appear here..."
                className="w-full h-48 p-3 sm:p-4 text-base sm:text-lg bg-gray-50 resize-none mt-4 border rounded-lg"
                value={translatedText}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-center mt-4 text-sm sm:text-base">
              {error}
            </div>
          )}

          <div className="flex justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
            <button
              onClick={handleTranslate}
              disabled={!inputText || isLoading}
              className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg flex items-center text-sm sm:text-base ${
                inputText && !isLoading
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ArrowRightLeft className={`mr-1 sm:mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Translating...' : 'Translate'}
            </button>

            {translatedText && (
              <button
                onClick={handleCopy}
                className="px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg flex items-center bg-gray-100 hover:bg-gray-200 text-sm sm:text-base"
              >
                {copySuccess ? (
                  <>
                    <ClipboardCheck className="mr-1 sm:mr-2 h-4 w-4 text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="mr-1 sm:mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleClear}
              disabled={!inputText && !translatedText}
              className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg flex items-center border text-sm sm:text-base ${
                inputText || translatedText
                  ? 'border-gray-300 hover:bg-gray-100'
                  : 'border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <X className="mr-1 sm:mr-2 h-4 w-4" />
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslatorApp;