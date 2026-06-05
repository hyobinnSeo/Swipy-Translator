// Helper function for getting tone instructions
const getToneInstructions = (tone, modelInstructions) => {
    const toneInstructions = modelInstructions['tone-instructions'];
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
    selectedTone,
    sourceLang,
    targetLang,
    LANGUAGE_NAMES,
    isParaphrase = false,
    additionalInstruction = ''
}) => {
    const preInstruction = isParaphrase
        ? modelInstructions['pre-instruction-paraphrase']
        : modelInstructions['pre-instruction'];
    const postInstruction = isParaphrase
        ? modelInstructions['post-instruction-paraphrase']
        : modelInstructions['post-instruction'];
    const toneInstructions = getToneInstructions(selectedTone, modelInstructions);

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

    if (additionalInstruction && additionalInstruction.trim()) {
        body += `Additional Instructions (apply these with high priority):\n${additionalInstruction.trim()}\n\n`;
    }

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

// Translation service for different models.
// modelSlug is the provider-specific model id (e.g. 'gemini-2.0-flash-001').
const translateWithGemini = async (
    text,
    previousTranslations = [],
    signal,
    apiKey,
    modelInstructions,
    selectedTone,
    sourceLang,
    targetLang,
    LANGUAGE_NAMES,
    isParaphrase = false,
    modelSlug = 'gemini-2.0-flash-001',
    additionalInstruction = ''
) => {
    if (!apiKey) {
        throw new Error('Please enter your Gemini API key in settings');
    }
    try {
        const { body, postInstruction } = buildPrompt({
            text,
            previousTranslations,
            modelInstructions,
            selectedTone,
            sourceLang,
            targetLang,
            LANGUAGE_NAMES,
            isParaphrase,
            additionalInstruction
        });

        const prompt = `${body}${postInstruction}`;

        const modelEndpoint = modelSlug || 'gemini-2.0-flash-001';

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


const translateWithOpenRouter = async (text, previousTranslations = [], signal, apiKey, modelInstructions, selectedTone, sourceLang, targetLang, LANGUAGE_NAMES, isParaphrase = false, modelSlug = 'cohere/command-r-08-2024', additionalInstruction = '') => {
    if (!apiKey) {
        throw new Error('Please enter your OpenRouter API key in settings');
    }

    const modelUrl = modelSlug || 'cohere/command-r-08-2024';

    const { body: prompt, postInstruction } = buildPrompt({
        text,
        previousTranslations,
        modelInstructions,
        selectedTone,
        sourceLang,
        targetLang,
        LANGUAGE_NAMES,
        isParaphrase,
        additionalInstruction
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

const translateWithOpenAI = async (text, previousTranslations = [], signal, apiKey, modelInstructions, selectedTone, sourceLang, targetLang, LANGUAGE_NAMES, isParaphrase = false, modelSlug = 'gpt-4o-mini', additionalInstruction = '') => {
    if (!apiKey) {
        throw new Error('Please enter your OpenAI API key in settings');
    }
    try {
        const { body, postInstruction } = buildPrompt({
            text,
            previousTranslations,
            modelInstructions,
            selectedTone,
            sourceLang,
            targetLang,
            LANGUAGE_NAMES,
            isParaphrase,
            additionalInstruction
        });

        const prompt = `${body}${postInstruction}`;

        const modelId = modelSlug || 'gpt-4o-mini';

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

// Direct Anthropic Messages API (no OpenRouter).
const translateWithAnthropic = async (text, previousTranslations = [], signal, apiKey, modelInstructions, selectedTone, sourceLang, targetLang, LANGUAGE_NAMES, isParaphrase = false, modelSlug = 'claude-sonnet-4-6', additionalInstruction = '') => {
    if (!apiKey) {
        throw new Error('Please enter your Anthropic API key in settings');
    }

    const modelId = modelSlug || 'claude-sonnet-4-6';

    const { body: prompt, postInstruction } = buildPrompt({
        text,
        previousTranslations,
        modelInstructions,
        selectedTone,
        sourceLang,
        targetLang,
        LANGUAGE_NAMES,
        isParaphrase,
        additionalInstruction
    });

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            signal,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                // Required to allow calling the Anthropic API directly from a browser.
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: modelId,
                max_tokens: 2000,
                system: postInstruction,
                messages: [
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            let message = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                message = errorData.error?.message || message;
            } catch (e) { /* ignore parse error */ }
            throw new Error(message);
        }

        const data = await response.json();
        const result = data.content?.find(part => part.type === 'text')?.text
            || data.content?.[0]?.text;
        if (!result) {
            throw new Error('Invalid response structure from Anthropic API');
        }
        return result;
    } catch (error) {
        if (error.name === 'AbortError') {
            throw error;
        }
        throw new Error(`Translation error: ${error.message}`);
    }
};

export {
    translateWithGemini,
    translateWithOpenRouter,
    translateWithOpenAI,
    translateWithAnthropic
};
