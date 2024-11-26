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

// Default voice mapping for each language
export const LANGUAGE_VOICE_MAPPING = {
    'en': 'en-US-Journey-F',
    'ko': 'ko-KR-Neural2-A',
    'ja': 'ja-JP-Neural2-B',
    'zh': 'cmn-TW-Wavenet-A',
    'ar': 'ar-XA-Wavenet-A',
    'fr': 'fr-FR-Journey-F',
    'es': 'es-ES-Journey-F',
    'it': 'it-IT-Journey-F',
    'de': 'de-DE-Journey-F',
    'pt': 'pt-BR-Neural2-A'
};

// Available voice options for each language
export const VOICE_OPTIONS = {
    'en': [
        { id: 'en-US-Journey-D', name: 'Journey (Male)' },
        { id: 'en-US-Journey-F', name: 'Journey (Female)' },
        { id: 'en-US-Journey-O', name: 'Journey (Female 2)' },
        { id: 'en-GB-Journey-D', name: 'Journey UK (Male)' },
        { id: 'en-GB-Journey-F', name: 'Journey UK (Female)' },
        { id: 'en-GB-Journey-O', name: 'Journey UK (Female 2)' },
        { id: 'en-AU-Journey-D', name: 'Journey AU (Male)' },
        { id: 'en-AU-Journey-F', name: 'Journey AU (Female)' },
        { id: 'en-AU-Journey-O', name: 'Journey AU (Female 2)' }
    ],
    'ko': [
        { id: 'ko-KR-Neural2-A', name: 'Neural2 A (여성)' },
        { id: 'ko-KR-Neural2-B', name: 'Neural2 B (여성)' },
        { id: 'ko-KR-Neural2-C', name: 'Neural2 C (남성)' }
    ],
    'ja': [
        { id: 'ja-JP-Neural2-B', name: 'Neural2 B (女性)' },
        { id: 'ja-JP-Neural2-C', name: 'Neural2 C (男性)' },
        { id: 'ja-JP-Neural2-D', name: 'Neural2 D (男性)' }
    ],
    'zh': [
        { id: 'cmn-TW-Wavenet-A', name: 'Wavenet A (女性)' },
        { id: 'cmn-TW-Wavenet-B', name: 'Wavenet B (男性)' },
        { id: 'cmn-TW-Wavenet-C', name: 'Wavenet C (男性)' }
    ],
    'fr': [
        { id: 'fr-FR-Journey-D', name: 'Journey (Homme)' },
        { id: 'fr-FR-Journey-F', name: 'Journey (Femme)' },
        { id: 'fr-FR-Journey-O', name: 'Journey (Femme 2)' },
        { id: 'fr-CA-Journey-D', name: 'Journey CA (Homme)' },
        { id: 'fr-CA-Journey-F', name: 'Journey CA (Femme)' },
        { id: 'fr-CA-Journey-O', name: 'Journey CA (Femme 2)' }
    ],
    'es': [
        { id: 'es-ES-Journey-D', name: 'Journey (Hombre)' },
        { id: 'es-ES-Journey-F', name: 'Journey (Mujer)' },
        { id: 'es-ES-Journey-O', name: 'Journey (Mujer 2)' },
        { id: 'es-US-Journey-D', name: 'Journey US (Hombre)' },
        { id: 'es-US-Journey-F', name: 'Journey US (Mujer)' },
        { id: 'es-US-Journey-O', name: 'Journey US (Mujer 2)' }
    ],
    'de': [
        { id: 'de-DE-Journey-D', name: 'Journey (Männlich)' },
        { id: 'de-DE-Journey-F', name: 'Journey (Weiblich)' },
        { id: 'de-DE-Journey-O', name: 'Journey (Weiblich 2)' }
    ],
    'it': [
        { id: 'it-IT-Journey-D', name: 'Journey (Uomo)' },
        { id: 'it-IT-Journey-F', name: 'Journey (Donna)' },
        { id: 'it-IT-Journey-O', name: 'Journey (Donna 2)' }
    ],
    'pt': [
        { id: 'pt-BR-Neural2-A', name: 'Neural2 A (Feminino)' },
        { id: 'pt-BR-Neural2-B', name: 'Neural2 B (Masculino)' },
        { id: 'pt-BR-Neural2-C', name: 'Neural2 C (Feminino)' }
    ],
    'ar': [
        { id: 'ar-XA-Wavenet-A', name: 'Wavenet A (أنثى)' },
        { id: 'ar-XA-Wavenet-B', name: 'Wavenet B (ذكر)' },
        { id: 'ar-XA-Wavenet-C', name: 'Wavenet C (ذكر)' },
        { id: 'ar-XA-Wavenet-D', name: 'Wavenet D (أنثى)' }
    ]
};

// Tone options for each model
export const TONES = {
    [MODELS.GEMINI]: [
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
    ],
    [MODELS.COMMAND]: [
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
            id: 'cardi_B',
            name: '카디비 / Cardi B',
            description: 'Raw and direct street tone'
        }
    ],
    [MODELS.ANTHROPIC]: [
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
            id: 'literary',
            name: '문학 / Literary',
            description: 'Elegant literary style'
        },
        {
            id: 'cardi_B',
            name: '카디비 / Cardi B',
            description: 'Raw and direct street tone'
        }
    ],
    [MODELS.OPENAI]: [
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
        },
        {
            id: 'cardi_B',
            name: '카디비 / Cardi B',
            description: 'Raw and direct street tone'
        }
    ]
};

// Default instructions for each model
export const DEFAULT_INSTRUCTIONS = {
    [MODELS.GEMINI]: {
        'pre-instruction': "You are a professional translator who specializes in providing accurate and natural translations. Your task is to create translations that convey the complete meaning, nuances, and cultural context of the source text while maintaining the linguistic features of the target language.",
        'post-instruction': "Note: Provide only the translated text. Do not include quotes, emojis, explanations or any additional comments.",
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
            'kid_friendly': `Tone and Style: Kid-Friendly
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
    },
    [MODELS.COMMAND]: {
        'pre-instruction': "You are a professional translator who specializes in providing accurate and natural translations. Your task is to create translations that convey the complete meaning, nuances, and cultural context of the source text while maintaining the linguistic features of the target language.",
        'post-instruction': "Note: Provide only the translated text. Do not include quotes, emojis, explanations or any additional comments.",
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
            'cardi_B': `Tone and Style:
- Be bold and unapologetic in delivery
- Keep it real and unfiltered AF
- Incorporate current street slang and vernacular
- Drop formality completely
- Focus on authenticity over politeness
- Use deliberate grammar/spelling variations for effect
- Adapt street idioms appropriately
- Mix casual profanity for emphasis`
        }
    },
    [MODELS.ANTHROPIC]: {
        'pre-instruction': "You are a professional translator who specializes in providing accurate and natural translations. Your task is to create translations that convey the complete meaning, nuances, and cultural context of the source text while maintaining the linguistic features of the target language.",
        'post-instruction': "Note: Provide only the translated text. Do not include quotes, emojis, explanations or any additional comments.",
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
            'literary': `Tone and Style:
- Use sophisticated vocabulary and phrasing
- Maintain artistic and creative expression
- Preserve metaphors and literary devices
- Focus on aesthetic quality
- Keep the elegant and refined style
- Adapt cultural references appropriately`,
            'cardi_B': `Tone and Style:
- Be bold and unapologetic in delivery
- Keep it real and unfiltered AF
- Incorporate current street slang and vernacular
- Drop formality completely
- Focus on authenticity over politeness
- Use deliberate grammar/spelling variations for effect
- Adapt street idioms appropriately
- Mix casual profanity for emphasis`
        }
    },
    [MODELS.OPENAI]: {
        'pre-instruction': "You are a professional translator who specializes in providing accurate and natural translations. Your task is to create translations that convey the complete meaning, nuances, and cultural context of the source text while maintaining the linguistic features of the target language.",
        'post-instruction': "Note: Provide only the translated text. Do not include quotes, emojis, explanations or any additional comments.",
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
- Adapt cultural references appropriately`,
            'cardi_B': `Tone and Style:
- Be bold and unapologetic in delivery
- Keep it real and unfiltered AF
- Incorporate current street slang and vernacular
- Drop formality completely
- Focus on authenticity over politeness
- Use deliberate grammar/spelling variations for effect
- Adapt street idioms appropriately
- Mix casual profanity for emphasis`
        }
    }
};

// Available models for translation
export const AVAILABLE_MODELS = [
    { id: MODELS.GEMINI, name: 'Gemini 1.5', api: 'google' },
    { id: MODELS.COMMAND, name: 'Cohere Command R', api: 'openrouter' },
    { id: MODELS.ANTHROPIC, name: 'Claude 3 Haiku', api: 'openrouter' },
    { id: MODELS.OPENAI, name: 'GPT-4o mini', api: 'openai' }
];

// Maximum number of items in history
export const MAX_HISTORY_ITEMS = 10;

// Maximum number of saved translations
export const MAX_SAVED_TRANSLATIONS = 50;

// Helper function for getting tone instructions
export const getToneInstructions = (tone, modelInstructions, selectedModel) => {
    const toneInstructions = modelInstructions[selectedModel]['tone-instructions'];
    return {
        instruction: toneInstructions[tone] || toneInstructions['standard']
    };
};
