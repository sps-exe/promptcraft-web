import Groq from 'groq-sdk';
import { buildPromptPayload } from './promptEngine.js';

const API_KEY = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env.VITE_GROQ_API_KEY : null;

const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';

// ── Improvement #1: Mode-Specific Temperature ─────────────────────────────
// Each mode has an optimal temperature based on its output requirements.
const MODE_TEMPERATURES = {
    code: 0.2,  // Deterministic — one correct solution
    analytical: 0.2,  // Must follow format strictly
    email: 0.4,  // Professional, predictable
    chat: 0.2,  // Must follow format strictly — no creative answering
    persona: 0.7,  // Slight variation allowed
    image: 0.75, // Creative but structured
    video: 0.75, // Creative but structured
    writing: 0.9,  // Full creative freedom
};

let groqClient = null;

function getClient(apiKey) {
    const key = apiKey || API_KEY;
    if (!key) return null;
    if (!groqClient || groqClient._key !== key) {
        groqClient = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });
        groqClient._key = key;
    }
    return groqClient;
}

// ── Improvement #2: Image Header Strip ────────────────────────────────────
// Image prompts must be plain text — strip any markdown headers/structure
// injected by the LLM that would break Midjourney/Dall-E.
function stripImageHeaders(text, detectedMode) {
    if (detectedMode !== 'image') return text;
    return text
        .replace(/^#{1,4}\s+.*/gm, '')      // Remove ## headers
        .replace(/^\*{1,2}[^*]+\*{1,2}/gm, '') // Remove **bold** lines
        .replace(/\n{3,}/g, '\n\n')           // Collapse extra blank lines
        .trim();
}

// ── Hardening: SMP Hard Cap ───────────────────────────────────────────────
function applySMPCap(text, originalWordCount) {
    if (originalWordCount >= 8) return text;
    const words = text.trim().split(/\s+/);
    if (words.length <= 60) return text;
    const sentences = text.split(/(?<=[?.!])\s+/);
    const questions = sentences.filter(s => s.trim().endsWith('?')).slice(0, 3);
    if (questions.length > 0) {
        return "Let's clarify a few things first:\n" + questions.map((q, i) => `${i + 1}. ${q.trim()}`).join('\n');
    }
    return words.slice(0, 60).join(' ') + '…';
}

// ── Hardening: Token Inflation Guard ──────────────────────────────────────
async function enforceTokenInflationGuard(text, client, originalWordCount, maxExpansionRatio) {
    if (originalWordCount >= 10 && !maxExpansionRatio) return text;

    const outputWords = text.trim().split(/\s+/).length;
    // Default cap is 15x. If maxExpansionRatio is set (e.g. 1.5 for informational), use that.
    const maxAllowed = Math.floor(originalWordCount * (maxExpansionRatio || 15));

    if (outputWords <= maxAllowed) return text;
    try {
        const compressionResponse = await client.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Compress the following text to under ${maxAllowed} words while preserving all essential meaning. Output ONLY the compressed text.`
                },
                { role: 'user', content: text }
            ],
            model: FALLBACK_MODEL, // Use fast model for compression
            temperature: 0.2,
            max_tokens: maxAllowed * 2,
        });
        return compressionResponse.choices[0]?.message?.content?.trim() || text;
    } catch {
        return text.trim().split(/\s+/).slice(0, maxAllowed).join(' ') + '…';
    }
}

// ── Improvement #4: Streaming Support ─────────────────────────────────────
// onChunk is called with each streamed text delta. If not provided, falls
// back to a regular non-streaming request.
export async function enhancePrompt(rawPrompt, mode, styleMemory, apiKey, onChunk = null) {
    const client = getClient(apiKey);
    if (!client) {
        throw new Error('API key not configured. Please add your Groq API key in Settings.');
    }

    const payload = buildPromptPayload(rawPrompt, mode, styleMemory);

    // Handle early returns from JS interceptors (no LLM call needed)
    if (payload.earlyReturn) {
        if (onChunk) onChunk(payload.earlyReturnText);
        return {
            text: payload.earlyReturnText,
            detectedMode: payload.detectedMode,
            stats: { originalWords: rawPrompt.trim().split(/\s+/).length, enhancedWords: payload.earlyReturnText.split(/\s+/).length, intercepted: true }
        };
    }

    const { systemPrompt, userMessage, detectedMode, deterministicLock, wordCount, maxExpansionRatio } = payload;
    const originalWordCount = wordCount || rawPrompt.trim().split(/\s+/).length;
    const temperature = MODE_TEMPERATURES[detectedMode] ?? 0.7;

    const makeRequest = async (model) => {
        if (onChunk) {
            // ── Streaming path ──
            const stream = await client.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                model,
                temperature,
                max_tokens: 1024,
                top_p: 0.9,
                stream: true,
            });

            let fullText = '';
            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta?.content || '';
                if (delta) {
                    fullText += delta;
                    onChunk(delta);
                }
            }
            return fullText;
        } else {
            // ── Non-streaming path ──
            const chatCompletion = await client.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                model,
                temperature,
                max_tokens: 1024,
                top_p: 0.9,
            });
            return chatCompletion.choices[0]?.message?.content || '';
        }
    };

    try {
        let result = '';
        try {
            result = await makeRequest(PRIMARY_MODEL);
        } catch (primaryError) {
            // ── Improvement #3: Fallback Model ─────────────────────────────
            if (primaryError.status === 429 || primaryError.status === 503) {
                result = await makeRequest(FALLBACK_MODEL);
            } else {
                throw primaryError;
            }
        }

        if (!result) throw new Error('No response received from AI.');
        result = result.trim();

        // Post-processing pipeline
        result = result.replace(/^(\*?\*?(Here is the )?enhanced prompt\*?\*?:?)\s*/i, '').trim();
        result = stripImageHeaders(result, detectedMode);          // #2
        result = applySMPCap(result, originalWordCount);           // Hardening
        result = await enforceTokenInflationGuard(result, client, originalWordCount, maxExpansionRatio); // Hardening

        // Append deterministic lock only if not already present
        if (deterministicLock && !result.includes(deterministicLock.slice(0, 30))) {
            result += '\n\n' + deterministicLock;
        }

        const enhancedWords = result.trim().split(/\s+/).length;
        const expansionPct = Math.round(((enhancedWords - originalWordCount) / originalWordCount) * 100);

        return {
            text: result,
            detectedMode,
            // ── Improvement #5: Quality Stats for UI ──────────────────────
            stats: {
                originalWords: originalWordCount,
                enhancedWords,
                expansionPct,
                temperature,
                model: PRIMARY_MODEL,
                intercepted: false,
            }
        };

    } catch (error) {
        if (error.status === 429) throw new Error('Rate limit reached. Please wait a moment and try again.');
        if (error.status === 401) throw new Error('Invalid API key. Please check your Groq API key in Settings.');
        throw new Error(error.message || 'Failed to enhance prompt. Please try again.');
    }
}
