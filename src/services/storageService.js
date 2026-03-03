const SAVED_PROMPTS_KEY = 'promptcraft_saved_prompts';
const STYLE_MEMORY_KEY = 'promptcraft_style_memory';
const STYLE_MEMORY_ENABLED_KEY = 'promptcraft_style_memory_enabled';
const API_KEY_STORAGE = 'promptcraft_api_key';
const MAX_SAVED_PROMPTS = 50;

// ── Saved Prompts ──

export function getSavedPrompts() {
    try {
        const data = localStorage.getItem(SAVED_PROMPTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function savePrompt({ original, enhanced, mode, label }) {
    const prompts = getSavedPrompts();
    if (prompts.length >= MAX_SAVED_PROMPTS) {
        return { success: false, error: `Maximum ${MAX_SAVED_PROMPTS} prompts reached. Please delete some old prompts.` };
    }

    const newPrompt = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2),
        original,
        enhanced,
        mode,
        label: label || '',
        timestamp: new Date().toISOString(),
    };

    prompts.unshift(newPrompt);
    localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(prompts));
    return { success: true, prompt: newPrompt };
}

export function deletePrompt(id) {
    const prompts = getSavedPrompts().filter(p => p.id !== id);
    localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(prompts));
    return prompts;
}

export function updatePromptLabel(id, label) {
    const prompts = getSavedPrompts().map(p =>
        p.id === id ? { ...p, label } : p
    );
    localStorage.setItem(SAVED_PROMPTS_KEY, JSON.stringify(prompts));
    return prompts;
}

// ── Style Memory ──

const STYLE_MEMORY_MAP_KEY = 'promptcraft_style_memory_map';

export function getStyleMemory() {
    return localStorage.getItem(STYLE_MEMORY_KEY) || '';
}

export function setStyleMemory(style) {
    localStorage.setItem(STYLE_MEMORY_KEY, style);
}

// Per-mode style memory (stored as a JSON map { mode: style })
export function getStyleMemoryForMode(mode) {
    try {
        const map = JSON.parse(localStorage.getItem(STYLE_MEMORY_MAP_KEY) || '{}');
        return map[mode] || '';
    } catch { return ''; }
}

export function setStyleMemoryForMode(mode, style) {
    try {
        const map = JSON.parse(localStorage.getItem(STYLE_MEMORY_MAP_KEY) || '{}');
        if (style) { map[mode] = style; } else { delete map[mode]; }
        localStorage.setItem(STYLE_MEMORY_MAP_KEY, JSON.stringify(map));
    } catch { /* ignore */ }
}

export function getAllStyleMemories() {
    try {
        return JSON.parse(localStorage.getItem(STYLE_MEMORY_MAP_KEY) || '{}');
    } catch { return {}; }
}

export function isStyleMemoryEnabled() {
    const val = localStorage.getItem(STYLE_MEMORY_ENABLED_KEY);
    return val === null ? false : val === 'true';
}

export function setStyleMemoryEnabled(enabled) {
    localStorage.setItem(STYLE_MEMORY_ENABLED_KEY, String(enabled));
}

// ── API Key ──

export function getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE) || '';
}

export function setApiKey(key) {
    localStorage.setItem(API_KEY_STORAGE, key);
}
