// Model identifiers
export const MODELS = {
    GEMINI: 'gemini',
    COMMAND: 'command',
    ANTHROPIC: 'claude',
    OPENAI: 'gpt'
};

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

// Default voice mapping for each language
export const LANGUAGE_VOICE_MAPPING = {
    'en': 'en-US-JennyNeural',
    'ko': 'ko-KR-SunHiNeural',
    'ja': 'ja-JP-NanamiNeural',
    'zh': 'zh-CN-XiaoxiaoNeural',
    'ar': 'ar-SA-ZariyahNeural',
    'fr': 'fr-FR-DeniseNeural',
    'es': 'es-ES-ElviraNeural',
    'it': 'it-IT-ElsaNeural',
    'de': 'de-DE-KatjaNeural',
    'pt': 'pt-BR-FranciscaNeural'
};

// Available voice options for each language
export const VOICE_OPTIONS = {
    'en': [
        { id: 'en-US-AriaNeural', name: 'Aria (Female)' },
        { id: 'en-US-GuyNeural', name: 'Guy (Male)' },
        { id: 'en-US-JennyNeural', name: 'Jenny (Female)' },
        { id: 'en-US-DavisNeural', name: 'Davis (Male)' }
    ],
    'ko': [
        { id: 'ko-KR-SunHiNeural', name: '선희 (여성)' },
        { id: 'ko-KR-InJoonNeural', name: '인준 (남성)' },
        { id: 'ko-KR-JiMinNeural', name: '지민 (여성)' },
        { id: 'ko-KR-BongJinNeural', name: '봉진 (남성)' }
    ],
    'ja': [
        { id: 'ja-JP-NanamiNeural', name: '七海 (女性)' },
        { id: 'ja-JP-KeitaNeural', name: '圭太 (男性)' },
        { id: 'ja-JP-AoiNeural', name: '葵 (女性)' },
        { id: 'ja-JP-DaichiNeural', name: '大智 (男性)' }
    ],
    'zh': [
        { id: 'zh-CN-XiaoxiaoNeural', name: '晓晓 (女性)' },
        { id: 'zh-CN-YunxiNeural', name: '云希 (男性)' },
        { id: 'zh-CN-XiaoyiNeural', name: '晓伊 (女性)' },
        { id: 'zh-CN-YunjianNeural', name: '云剑 (男性)' }
    ],
    'fr': [
        { id: 'fr-FR-DeniseNeural', name: 'Denise (Femme)' },
        { id: 'fr-FR-HenriNeural', name: 'Henri (Homme)' }
    ],
    'es': [
        { id: 'es-ES-ElviraNeural', name: 'Elvira (Mujer)' },
        { id: 'es-ES-AlvaroNeural', name: 'Alvaro (Hombre)' }
    ],
    'de': [
        { id: 'de-DE-KatjaNeural', name: 'Katja (Weiblich)' },
        { id: 'de-DE-ConradNeural', name: 'Conrad (Männlich)' }
    ],
    'it': [
        { id: 'it-IT-ElsaNeural', name: 'Elsa (Donna)' },
        { id: 'it-IT-DiegoNeural', name: 'Diego (Uomo)' }
    ],
    'pt': [
        { id: 'pt-BR-FranciscaNeural', name: 'Francisca (Feminino)' },
        { id: 'pt-BR-AntonioNeural', name: 'Antonio (Masculino)' }
    ],
    'ar': [
        { id: 'ar-SA-ZariyahNeural', name: 'زارية (أنثى)' },
        { id: 'ar-SA-HamedNeural', name: 'حامد (ذكر)' }
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
