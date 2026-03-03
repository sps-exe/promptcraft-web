export const MODE_KEYWORDS = {
    image: ['image', 'picture', 'photo', 'drawing', 'illustration', 'render', 'midjourney', 'dalle', 'stable diffusion', 'logo', 'portrait', 'visual', 'cinematic', '8k', 'lens', 'shot', 'hyperreal', 'lighting'],
    video: ['video', 'animation', 'clip', 'movie', 'short film', 'runway', 'sora', 'pika', 'kling'],
    code: ['code', 'function', 'script', 'react', 'python', 'javascript', 'html', 'css', 'bug', 'error', 'database', 'api', 'component', 'reverse list', 'reverse', 'sort', 'algorithm'],
    writing: ['story', 'blog', 'article', 'essay', 'poem', 'script', 'novel', 'chapter', 'creative', 'write', 'create'],
    analytical: ['analyze', 'explain', 'summarize', 'compare', 'contrast', 'evaluate', 'review', 'breakdown'],
    email: ['email', 'mail', 'letter', 'memo', 'message', 'draft', 'reply', 'newsletter', 'subject line', 'professor', 'prof', 'formal'],
    persona: ['act as', 'pretend you are', 'in the style of', 'roleplay', 'you are a', 'persona']
};

export function classifyIntent(prompt) {
    if (!prompt || typeof prompt !== 'string') {
        return 'chat';
    }

    const lowerPrompt = prompt.toLowerCase();
    const wordCount = prompt.trim().split(/\s+/).length;

    // --- IMAGE CONFIDENCE BOOST ---
    // If 2+ cinematic keywords appear, always route to image regardless of prompt length
    const cinematicKeywords = ['cinematic', '8k', 'lens', 'shot', 'visual', 'render', 'hyperreal', 'aspect ratio', 'lighting', 'portrait'];
    const cinematicHits = cinematicKeywords.filter(kw => lowerPrompt.includes(kw)).length;
    if (cinematicHits >= 2) {
        return 'image';
    }

    // --- MICRO-INTENT HEURISTICS (short prompts < 8 words) ---
    if (wordCount < 8) {
        if (/mail|email|prof\b|professor|formal/.test(lowerPrompt)) return 'email';
        if (/python|function|code|reverse|bug|script|sort|algorithm/.test(lowerPrompt)) return 'code';
        if (/visual|render|cinematic|8k|portrait|shot|lens/.test(lowerPrompt)) return 'image';
        if (/story|poem|write|create/.test(lowerPrompt)) return 'writing';
    }

    // Check for explicit persona framing first
    if (MODE_KEYWORDS.persona.some(kw => lowerPrompt.includes(kw))) {
        return 'persona';
    }

    // Check formatting heuristics for code (e.g., presence of backticks, braces, common syntax)
    if (lowerPrompt.includes('```') || /function\s*\(/.test(lowerPrompt) || lowerPrompt.includes('const ') || lowerPrompt.includes('def ')) {
        return 'code';
    }

    let maxScore = 0;
    let detectedMode = 'chat';

    // Simple keyword scoring
    for (const [mode, keywords] of Object.entries(MODE_KEYWORDS)) {
        if (mode === 'persona') continue; // Handled specially above

        let score = 0;
        for (const kw of keywords) {
            // Use regex to match whole words mostly, or simple includes
            const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'i');
            if (regex.test(lowerPrompt)) {
                score++;
            } else if (kw.length > 4 && lowerPrompt.includes(kw)) {
                score += 0.5; // partial match for longer words
            }
        }

        if (score > maxScore) {
            maxScore = score;
            detectedMode = mode;
        }
    }

    // If no strong keyword match, but it's very short, it's likely a chat or search query
    if (maxScore === 0 && wordCount < 5) {
        return 'chat';
    }

    return detectedMode;
}
