// Model identifiers
export const MODELS = {
    GEMINI: 'gemini',
    COMMAND: 'command',
    ANTHROPIC: 'claude',
    OPENAI: 'gpt'
};

// Current app version - used to enforce password protection
export const APP_VERSION = '2.0.0';
export const MIN_SECURE_VERSION = '2.0.0'; // Version where password protection was added

// Language names and their display values
export const LANGUAGE_NAMES = {
    'auto': 'Auto Detect',
    'en': 'English',
    'fr': 'French / Français',
    'es': 'Spanish / Español',
    'it': 'Italian / Italiano',
    'de': 'German / Deutsch',
    'pt': 'Brazilian Portuguese / Português',
    'ja': 'Japanese / 日本語',
    'ko': 'Korean / 한국어',
    'zh': 'Simplified Chinese / 简体中文',
    'ar': 'Arabic / العربية'
};

// Gemini-TTS model used for speech synthesis
export const GEMINI_TTS_MODEL = 'gemini-2.5-flash-tts';

// Map app language codes to the BCP-47 locales supported by Gemini-TTS
export const GEMINI_LANGUAGE_CODES = {
    'en': 'en-US',
    'ko': 'ko-KR',
    'ja': 'ja-JP',
    'zh': 'cmn-CN',
    'ar': 'ar-EG',
    'fr': 'fr-FR',
    'es': 'es-ES',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-BR'
};

// Gemini-TTS prebuilt voices (language-independent; usable across all locales)
export const GEMINI_VOICES = [
    { id: 'Achernar', name: 'Achernar (여성)' },
    { id: 'Achird', name: 'Achird (남성)' },
    { id: 'Algenib', name: 'Algenib (남성)' },
    { id: 'Algieba', name: 'Algieba (남성)' },
    { id: 'Alnilam', name: 'Alnilam (남성)' },
    { id: 'Aoede', name: 'Aoede (여성)' },
    { id: 'Autonoe', name: 'Autonoe (여성)' },
    { id: 'Callirrhoe', name: 'Callirrhoe (여성)' },
    { id: 'Charon', name: 'Charon (남성)' },
    { id: 'Despina', name: 'Despina (여성)' },
    { id: 'Enceladus', name: 'Enceladus (남성)' },
    { id: 'Erinome', name: 'Erinome (여성)' },
    { id: 'Fenrir', name: 'Fenrir (남성)' },
    { id: 'Gacrux', name: 'Gacrux (여성)' },
    { id: 'Iapetus', name: 'Iapetus (남성)' },
    { id: 'Kore', name: 'Kore (여성)' },
    { id: 'Laomedeia', name: 'Laomedeia (여성)' },
    { id: 'Leda', name: 'Leda (여성)' },
    { id: 'Orus', name: 'Orus (남성)' },
    { id: 'Pulcherrima', name: 'Pulcherrima (여성)' },
    { id: 'Puck', name: 'Puck (남성)' },
    { id: 'Rasalgethi', name: 'Rasalgethi (남성)' },
    { id: 'Sadachbia', name: 'Sadachbia (남성)' },
    { id: 'Sadaltager', name: 'Sadaltager (남성)' },
    { id: 'Schedar', name: 'Schedar (남성)' },
    { id: 'Sulafat', name: 'Sulafat (여성)' },
    { id: 'Umbriel', name: 'Umbriel (남성)' },
    { id: 'Vindemiatrix', name: 'Vindemiatrix (여성)' },
    { id: 'Zephyr', name: 'Zephyr (여성)' },
    { id: 'Zubenelgenubi', name: 'Zubenelgenubi (남성)' }
];

// Default Gemini-TTS voice per language
export const LANGUAGE_VOICE_MAPPING = {
    'en': 'Kore',
    'ko': 'Kore',
    'ja': 'Kore',
    'zh': 'Kore',
    'ar': 'Kore',
    'fr': 'Kore',
    'es': 'Kore',
    'de': 'Kore',
    'it': 'Kore',
    'pt': 'Kore'
};

// Unified tone options (Gemini standard) shared across all AI models
export const TONES = [
    {
        id: 'standard',
        name: '표준 / Standard',
        description: 'Regular translation'
    },
    {
        id: 'casual',
        name: '캐주얼 / Casual',
        description: 'Friendly and relaxed tone'
    },
    {
        id: 'formal',
        name: '격식체 / Formal',
        description: 'Professional and polite tone'
    },
    {
        id: 'humorous',
        name: '유머러스 / Humorous',
        description: 'Humorous and witty tone'
    },
    {
        id: 'business',
        name: '비즈니스 / Business',
        description: 'Business-oriented tone'
    },
    {
        id: 'kid_friendly',
        name: '어린이용 / Kid-Friendly',
        description: 'Simple and fun kid-friendly tone'
    },
    {
        id: 'literary',
        name: '문학 / Literary',
        description: 'Elegant literary style'
    }
];

// Unified default instructions (Gemini standard) shared across all AI models
export const DEFAULT_INSTRUCTIONS = {
    'pre-instruction': "You are a professional translator who specializes in providing accurate and natural translations. Your task is to create translations that convey the complete meaning, nuances, and cultural context of the source text while maintaining the linguistic features of the target language.",
    'pre-instruction-paraphrase': "You are a skilled language expert specializing in paraphrasing. Your task is to rewrite the given text while maintaining its core meaning but using different words and sentence structures. Focus on preserving the original message while providing a fresh perspective and natural flow.",
    'post-instruction': "Note: Provide only the translated text. Do not include quotes, emojis, explanations or any additional comments.",
    'post-instruction-paraphrase': "Note: Provide only the paraphrased text. Do not include quotes, emojis, explanations or any additional comments.",
    'tone-instructions': {
        'standard': `Tone and Style:
- Maintain a neutral and clear tone
- Use standard language conventions
- Focus on accurate meaning transmission
- Keep formal and informal elements balanced
- Ensure natural flow in the target language`,
        'casual': `Tone and Style:
- Use everyday conversational language
- Incorporate common colloquialisms when appropriate
- Keep the tone friendly and approachable
- Use contractions where natural
- Maintain an informal yet respectful tone
- Adapt idioms to target language equivalents`,
        'formal': `Tone and Style:
- Use formal language throughout
- Maintain professional terminology
- Avoid contractions and colloquialisms
- Use proper honorifics where applicable
- Keep a respectful and courteous tone
- Prioritize precise and elegant expression`,
        'humorous': `Tone and Style:
- Use witty and clever expressions
- Incorporate appropriate humor and wordplay
- Keep the tone engaging and entertaining
- Use creative language choices
- Maintain cultural sensitivity while being playful
- Adapt jokes and puns to target language context`,
        'business': `Tone and Style:
- Use professional business language
- Incorporate industry-standard terminology
- Maintain clear and concise expression
- Use appropriate business formalities
- Keep a professional yet accessible tone
- Focus on clarity and efficiency in communication`,
        'kid_friendly': `Tone and Style:
- Use simple, friendly words
- Make sure everything is easy to understand
- Keep the tone encouraging and playful`,
        'literary': `Tone and Style:
- Use sophisticated vocabulary and phrasing
- Maintain artistic and creative expression
- Preserve metaphors and literary devices
- Focus on aesthetic quality
- Keep the elegant and refined style
- Adapt cultural references appropriately`
    }
};

// Available models for translation
export const AVAILABLE_MODELS = [
    { id: MODELS.GEMINI, name: 'Gemini 2.5 Flash', api: 'google', modelSlug: 'gemini-2.5-flash' },
    { id: MODELS.GEMINI, name: 'Gemini 3 Flash Preview', api: 'google', modelSlug: 'gemini-3-flash-preview' },
    { id: MODELS.GEMINI, name: 'Gemini 3.5 Flash', api: 'google', modelSlug: 'gemini-3.5-flash' },
    { id: MODELS.GEMINI, name: 'Gemini 3.1 Flash Lite', api: 'google', modelSlug: 'gemini-3.1-flash-lite' },
    { id: MODELS.OPENAI, name: 'GPT-5.4 mini', api: 'openai', modelSlug: 'gpt-5.4-mini' },
    { id: MODELS.ANTHROPIC, name: 'Claude Sonnet 4.6', api: 'anthropic', modelSlug: 'claude-sonnet-4-6' },
    { id: MODELS.ANTHROPIC, name: 'Claude Haiku 4.5', api: 'anthropic', modelSlug: 'claude-haiku-4-5-20251001' }
];

// Maximum number of items in history
export const MAX_HISTORY_ITEMS = 10;

// Maximum number of saved translations
export const MAX_SAVED_TRANSLATIONS = 50;

// Helper function for getting tone instructions
export const getToneInstructions = (tone, modelInstructions, isParaphrase = false) => {
    const toneInstructions = modelInstructions['tone-instructions'];
    return {
        instruction: toneInstructions[tone] || toneInstructions['standard']
    };
};
