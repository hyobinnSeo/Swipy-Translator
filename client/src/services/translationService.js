// Helper function for getting tone instructions
const getToneInstructions = (tone, modelInstructions, selectedModel) => {
    const toneInstructions = modelInstructions[selectedModel]['tone-instructions'];
    return {
        instruction: toneInstructions[tone] || toneInstructions['standard']
    };
};

// Build the shared prompt body used by every model.
// Returns { preInstruction, body, postInstruction } so each provider can
// arrange them into its own message format.
const buildPrompt = ({
    text,
    previousTranslations = [],
    modelInstructions,
    selectedModel,
    selectedTone,
    sourceLang,
    targetLang,
    LANGUAGE_NAMES,
    isParaphrase = false
}) => {
    const preInstruction = isParaphrase
        ? modelInstructions[selectedModel]['pre-instruction-paraphrase']
        : modelInstructions[selectedModel]['pre-instruction'];
    const postInstruction = isParaphrase
        ? modelInstructions[selectedModel]['post-instruction-paraphrase']
        : modelInstructions[selectedModel]['post-instruction'];
    const toneInstructions = getToneInstructions(selectedTone, modelInstructions, selectedModel);

    const sourceLanguage = LANGUAGE_NAMES[sourceLang] || sourceLang;
    const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang;

    let body = `Instructions:\n${preInstruction}\n\n`;

    body += `Language:\n`;
    if (isParaphrase) {
        body += `- Paraphrase in: ${targetLanguage}\n\n`;
    } else if (sourceLang === 'auto') {
        body += `- Detect source language and translate to ${targetLanguage}\n\n`;
    } else {
        body += `- From: ${sourceLanguage}\n- To: ${targetLanguage}\n\n`;
    }

    body += `${isParaphrase ? 'Paraphrasing Style' : 'Tone'}:\n${toneInstructions.instruction}\n\n`;
    body += `${isParaphrase ? 'Text to paraphrase' : 'Text to be translated'}:\n${text}\n\n`;

    if (previousTranslations.length > 0) {
        body += `Previous ${isParaphrase ? 'paraphrases' : 'translations'} to avoid repeating:\n`;
        previousTranslations.forEach((trans, index) => {
            body += `${index + 1}: ${trans.text}\n`;
        });
        body += `\nNote: Provide a fresh ${isParaphrase ? 'paraphrase' : 'translation'} different from the above versions.\n\n`;
    }

    return { preInstruction, body, postInstruction };
};

// Translation service for different models
const translateWithGemini = async (
    text,
    previousTranslations = [],
    signal,
    apiKey,
    modelInstructions,
    selectedModel,
    selectedTone,
    sourceLang,
    targetLang,
    LANGUAGE_NAMES,
    isParaphrase = false,
    modelName = 'Gemini 2.0 Flash'  // Updated default model name
) => {
    if (!apiKey) {
        throw new Error('Please enter your Gemini API key in settings');
    }
    try {
        const { body, postInstruction } = buildPrompt({
            text,
            previousTranslations,
            modelInstructions,
            selectedModel,
            selectedTone,
            sourceLang,
            targetLang,
            LANGUAGE_NAMES,
            isParaphrase
        });

        const prompt = `${body}${postInstruction}`;

        // Determine model based on name for Gemini 2.0
        // If modelName is 'Gemini 2.0 Flash Lite', use the flash lite preview endpoint;
        // otherwise, use the standard Gemini 2.0 Flash endpoint.
        const modelEndpoint = modelName === 'Gemini 2.0 Flash Lite'
            ? 'gemini-2.0-flash-lite-preview-02-05'
            : 'gemini-2.0-flash-001';

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelEndpoint}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                signal,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                })
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response structure from Gemini API');
        }

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        if (error.name === 'AbortError') {
            throw error;
        }
        throw error;
    }
};


const translateWithOpenRouter = async (text, modelId, previousTranslations = [], signal, apiKey, modelInstructions, selectedModel, selectedTone, sourceLang, targetLang, LANGUAGE_NAMES, isParaphrase = false, modelName = '') => {
    if (!apiKey) {
        throw new Error('Please enter your OpenRouter API key in settings');
    }
    
    // Determine the model URL based on the model name
    let modelUrl;
    if (modelId === 'claude') {
        modelUrl = modelName === 'Claude 3.5 Sonnet' 
            ? 'anthropic/claude-3.5-sonnet'
            : 'anthropic/claude-3-haiku';
    } else {
        modelUrl = modelName === 'Cohere Command R+'
            ? 'cohere/command-r-plus-08-2024'
            : 'cohere/command-r-08-2024';
    }

    const { body: prompt, postInstruction } = buildPrompt({
        text,
        previousTranslations,
        modelInstructions,
        selectedModel,
        selectedTone,
        sourceLang,
        targetLang,
        LANGUAGE_NAMES,
        isParaphrase
    });

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            signal,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Translator App'
            },
            body: JSON.stringify({
                model: modelUrl,
                messages: [
                    { role: "system", content: prompt },
                    { role: "system", content: postInstruction }
                ]
            })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.choices[0]?.message?.content;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error;
        }
        throw new Error(error.message === 'Unauthorized'
            ? 'Invalid API key. Please check your environment variables.'
            : `Translation error: ${error.message}`);
    }
};

const translateWithOpenAI = async (text, previousTranslations = [], signal, apiKey, modelInstructions, selectedModel, selectedTone, sourceLang, targetLang, LANGUAGE_NAMES, isParaphrase = false, modelName = 'GPT-4o mini') => {
    if (!apiKey) {
        throw new Error('Please enter your OpenAI API key in settings');
    }
    try {
        const { body, postInstruction } = buildPrompt({
            text,
            previousTranslations,
            modelInstructions,
            selectedModel,
            selectedTone,
            sourceLang,
            targetLang,
            LANGUAGE_NAMES,
            isParaphrase
        });

        const prompt = `${body}${postInstruction}`;

        // Determine model based on name
        const modelId = modelName === 'GPT-4o mini' ? 'gpt-4o-mini' : 'gpt-4o';

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            signal,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelId,
                messages: [
                    { role: "system", content: "You are a professional translator." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error;
        }
        throw new Error(error.message === 'Unauthorized'
            ? 'Invalid OpenAI API key. Please check your environment variables.'
            : `Translation error: ${error.message}`);
    }
};

export {
    translateWithGemini,
    translateWithOpenRouter,
    translateWithOpenAI
};
