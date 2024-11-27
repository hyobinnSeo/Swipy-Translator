// Translation service for different models
const translateWithGemini = async (text, previousTranslations = [], signal, apiKey, modelInstructions, selectedModel, selectedTone, sourceLang, targetLang, LANGUAGE_NAMES, isParaphrase = false) => {
    if (!apiKey) {
        throw new Error('Please enter your Gemini API key in settings');
    }
    try {
        // Get base instructions
        const basePreInstruction = isParaphrase 
            ? modelInstructions[selectedModel]['pre-instruction-paraphrase']
            : modelInstructions[selectedModel]['pre-instruction'];
        const postInstruction = isParaphrase
            ? modelInstructions[selectedModel]['post-instruction-paraphrase']
            : modelInstructions[selectedModel]['post-instruction'];
        const toneInstructions = getToneInstructions(selectedTone, modelInstructions, selectedModel, isParaphrase);

        // Construct the prompt
        let prompt = `Instructions:\n${basePreInstruction}\n\n`;

        // Add Language settings if not in paraphrase mode
        if (!isParaphrase) {
            const sourceLanguage = LANGUAGE_NAMES[sourceLang] || sourceLang;
            const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang;
            
            prompt += `Language:\n`;
            if (sourceLang === 'auto') {
                prompt += `- Detect source language and translate to ${targetLanguage}\n\n`;
            } else {
                prompt += `- From: ${sourceLanguage}\n- To: ${targetLanguage}\n\n`;
            }
        }

        // Add Tone settings
        prompt += `${isParaphrase ? 'Paraphrasing Style' : 'Tone'}:\n${toneInstructions.instruction}\n\n`;

        // Add text to process
        prompt += `${isParaphrase ? 'Text to paraphrase' : 'Text to be translated'}:\n${text}\n\n`;

        // Add previous translations/paraphrases if any
        if (previousTranslations.length > 0) {
            prompt += `Previous ${isParaphrase ? 'paraphrases' : 'translations'} to avoid repeating:\n`;
            previousTranslations.forEach((trans, index) => {
                prompt += `${index + 1}: ${trans.text}\n`;
            });
            prompt += `\nNote: Provide a fresh ${isParaphrase ? 'paraphrase' : 'translation'} different from the above versions.\n\n`;
        }

        // Add post instructions
        prompt += postInstruction;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

const translateWithOpenRouter = async (text, modelId, previousTranslations = [], signal, apiKey, modelInstructions, selectedModel, selectedTone, sourceLang, targetLang, LANGUAGE_NAMES, isParaphrase = false) => {
    if (!apiKey) {
        throw new Error('Please enter your OpenRouter API key in settings');
    }
    const modelUrl = modelId === 'claude'
        ? 'anthropic/claude-3-haiku'
        : 'cohere/command-r-08-2024';

    // Get base instructions
    const basePreInstruction = isParaphrase 
        ? modelInstructions[selectedModel]['pre-instruction-paraphrase']
        : modelInstructions[selectedModel]['pre-instruction'];
    const postInstruction = isParaphrase
        ? modelInstructions[selectedModel]['post-instruction-paraphrase']
        : modelInstructions[selectedModel]['post-instruction'];
    const toneInstructions = getToneInstructions(selectedTone, modelInstructions, selectedModel, isParaphrase);

    // Construct the prompt for system message
    let prompt = `Instructions:\n${basePreInstruction}\n\n`;

    // Add Language settings if not in paraphrase mode
    if (!isParaphrase) {
        const sourceLanguage = LANGUAGE_NAMES[sourceLang] || sourceLang;
        const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang;
        
        prompt += `Language:\n`;
        if (sourceLang === 'auto') {
            prompt += `- Detect source language and translate to ${targetLanguage}\n\n`;
        } else {
            prompt += `- From: ${sourceLanguage}\n- To: ${targetLanguage}\n\n`;
        }
    }

    // Add Tone settings
    prompt += `${isParaphrase ? 'Paraphrasing Style' : 'Tone'}:\n${toneInstructions.instruction}\n\n`;

    // Add text to process
    prompt += `${isParaphrase ? 'Text to paraphrase' : 'Text to be translated'}:\n${text}\n\n`;

    // Add previous translations/paraphrases if any
    if (previousTranslations.length > 0) {
        prompt += `Previous ${isParaphrase ? 'paraphrases' : 'translations'} to avoid repeating:\n`;
        previousTranslations.forEach((trans, index) => {
            prompt += `${index + 1}: ${trans.text}\n`;
        });
        prompt += `\nNote: Provide a fresh ${isParaphrase ? 'paraphrase' : 'translation'} different from the above versions.\n\n`;
    }

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

const translateWithOpenAI = async (text, previousTranslations = [], signal, apiKey, modelInstructions, selectedModel, selectedTone, sourceLang, targetLang, LANGUAGE_NAMES, isParaphrase = false) => {
    if (!apiKey) {
        throw new Error('Please enter your OpenAI API key in settings');
    }
    try {
        // Get base instructions
        const basePreInstruction = isParaphrase 
            ? modelInstructions[selectedModel]['pre-instruction-paraphrase']
            : modelInstructions[selectedModel]['pre-instruction'];
        const postInstruction = isParaphrase
            ? modelInstructions[selectedModel]['post-instruction-paraphrase']
            : modelInstructions[selectedModel]['post-instruction'];
        const toneInstructions = getToneInstructions(selectedTone, modelInstructions, selectedModel, isParaphrase);

        // Construct the prompt
        let prompt = `Instructions:\n${basePreInstruction}\n\n`;

        // Add Language settings if not in paraphrase mode
        if (!isParaphrase) {
            const sourceLanguage = LANGUAGE_NAMES[sourceLang] || sourceLang;
            const targetLanguage = LANGUAGE_NAMES[targetLang] || targetLang;
            
            prompt += `Language:\n`;
            if (sourceLang === 'auto') {
                prompt += `- Detect source language and translate to ${targetLanguage}\n\n`;
            } else {
                prompt += `- From: ${sourceLanguage}\n- To: ${targetLanguage}\n\n`;
            }
        }

        // Add Tone settings
        prompt += `${isParaphrase ? 'Paraphrasing Style' : 'Tone'}:\n${toneInstructions.instruction}\n\n`;

        // Add text to process
        prompt += `${isParaphrase ? 'Text to paraphrase' : 'Text to be translated'}:\n${text}\n\n`;

        // Add previous translations/paraphrases if any
        if (previousTranslations.length > 0) {
            prompt += `Previous ${isParaphrase ? 'paraphrases' : 'translations'} to avoid repeating:\n`;
            previousTranslations.forEach((trans, index) => {
                prompt += `${index + 1}: ${trans.text}\n`;
            });
            prompt += `\nNote: Provide a fresh ${isParaphrase ? 'paraphrase' : 'translation'} different from the above versions.\n\n`;
        }

        // Add post instructions
        prompt += postInstruction;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            signal,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini-2024-07-18",
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

// Helper function for getting tone instructions
const getToneInstructions = (tone, modelInstructions, selectedModel, isParaphrase = false) => {
    const toneInstructions = isParaphrase 
        ? modelInstructions[selectedModel]['tone-instructions-paraphrase']
        : modelInstructions[selectedModel]['tone-instructions'];
    return {
        instruction: toneInstructions[tone] || toneInstructions['standard']
    };
};

export {
    translateWithGemini,
    translateWithOpenRouter,
    translateWithOpenAI
};
