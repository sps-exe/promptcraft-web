import { classifyIntent } from './intentClassifier.js';
import {
    SYSTEM_PROMPTS,
    DETERMINISM_LAYER,
    REDUNDANCY_COMPRESSION,
    ANTI_HALLUCINATION_GUARD,
    ADAPTIVE_INTELLIGENCE_LAYER,
    PRECISION_LAYER,
    DETERMINISTIC_LOCKS,
    SESA_LAYER,
    COMPRESSION_ONLY_PROMPT
} from '../config/systemPrompts.js';

// ─── HARDENING PATCH v1.1: Informational Sub-Classification ───
// Detects if a Writing/Chat mode prompt is just an informational query
export function isInformationalQuery(rawPrompt) {
    const p = rawPrompt.toLowerCase();
    const isQuestion = /^(how|what|why|who|can you explain|explain|describe|what is|how to)\b/.test(p);
    const hasStructureReq = /\b(essay|article|blog|report|sections|headings|bullet|words|paragraphs)\b/.test(p);
    return isQuestion && !hasStructureReq && p.split(/\s+/).length < 40;
}

// Patch 1: Missing Document Interceptor
// Hard block: if user says "improve this X" with no actual content, return early.
function checkMissingDocument(rawPrompt) {
    const pattern = /^(improve|edit|revise|fix|make)\s+(this|the)\s+(\w+)(\s+better|\s+stronger|\s+cleaner)?\s*\.?\s*$/i;
    const hasInlineContent = rawPrompt.includes('"') || rawPrompt.includes('\n') || rawPrompt.trim().length > 80;
    if (pattern.test(rawPrompt.trim()) && !hasInlineContent) {
        const noun = rawPrompt.match(/(?:improve|edit|revise|fix|make)\s+(?:this|the)\s+(\w+)/i)?.[1] || 'document';
        return `Please provide the full content of the ${noun} you would like revised.`;
    }
    return null;
}

// Patch 3: Multi-Task Collision Resolver
// If prompt chains multiple tasks with "Also", "And also", or 3+ independent sentences.
function checkMultiTask(rawPrompt) {
    const hasAlso = /\.\s+(Also|And also)\s+/i.test(rawPrompt);
    const sentences = rawPrompt.split(/\.\s+/).filter(s => s.trim().split(/\s+/).length > 3);
    if (hasAlso || sentences.length >= 3) {
        return `This request contains multiple distinct tasks.\nWould you like them handled separately or combined into a single response?`;
    }
    return null;
}

// Patch 5: Reprocessing Stabilizer Pre-Check
// If input already has headers/structured bullets/lock text → compression-only mode.
function isStructuredInput(rawPrompt) {
    const hasHeaders = /^#{1,3}\s+/m.test(rawPrompt);
    const hasBullets = /^\*\s+/m.test(rawPrompt);
    const hasLock = rawPrompt.includes('Before responding, verify') || rawPrompt.includes('Output must contain only');
    return hasHeaders || (hasBullets && rawPrompt.split(/\n/).length > 5) || hasLock;
}

// ────────────────────────────────────────────────────────────────────────────

export function buildPromptPayload(rawPrompt, explicitMode, styleMemory) {
    const wordCount = rawPrompt.trim().split(/\s+/).length;

    // --- INTERCEPTOR 1: Missing Document Hard Block ---
    const docBlock = checkMissingDocument(rawPrompt);
    if (docBlock) {
        return { earlyReturn: true, earlyReturnText: docBlock, detectedMode: 'chat' };
    }

    // --- INTERCEPTOR 3: Multi-Task Collision ---
    const multiTaskBlock = checkMultiTask(rawPrompt);
    if (multiTaskBlock) {
        return { earlyReturn: true, earlyReturnText: multiTaskBlock, detectedMode: 'chat' };
    }

    let mode = explicitMode;
    let detectedMode = explicitMode;

    // Intent Classification
    if (!mode || mode === 'auto') {
        detectedMode = classifyIntent(rawPrompt);
    }

    // Mode Router
    let baseSystemPrompt = SYSTEM_PROMPTS[detectedMode];
    if (!baseSystemPrompt) {
        baseSystemPrompt = SYSTEM_PROMPTS['chat'];
        detectedMode = 'chat';
    }

    // --- INTERCEPTOR 5: Reprocessing Stabilizer ---
    // If input is already structured, use compression-only prompt instead of full pipeline.
    if (isStructuredInput(rawPrompt)) {
        const compressionPrompt = COMPRESSION_ONLY_PROMPT;
        return {
            systemPrompt: compressionPrompt,
            userMessage: rawPrompt,
            detectedMode,
            deterministicLock: null,
            compressionOnly: true
        };
    }

    // --- INTERCEPTOR 6: Informational Query Expansion Clamp ---
    const isInfoQuery = ['writing', 'chat', 'analytical'].includes(detectedMode) && isInformationalQuery(rawPrompt);

    // Full pipeline assembly
    // For lean modes (chat/analytical), skip the heavy structure-injecting layers
    const isLeanMode = ['chat', 'analytical'].includes(detectedMode);

    let finalSystemPrompt = baseSystemPrompt;

    if (!isLeanMode) {
        finalSystemPrompt += '\n\n' + DETERMINISM_LAYER
            + '\n\n' + REDUNDANCY_COMPRESSION;
    }

    if (['writing', 'email', 'code'].includes(detectedMode)) {
        finalSystemPrompt += '\n\n' + ANTI_HALLUCINATION_GUARD;
    }

    if (!isLeanMode) {
        finalSystemPrompt += '\n\n' + ADAPTIVE_INTELLIGENCE_LAYER;
        finalSystemPrompt += '\n\n' + PRECISION_LAYER;
    }

    finalSystemPrompt += '\n\n' + SESA_LAYER;

    let userMessage = `TASK: Enhance the following prompt. DO NOT answer the prompt or fulfill the request. ONLY output the enhanced prompt text.\n\nRAW PROMPT:\n"""\n${rawPrompt}\n"""`;
    if (styleMemory && styleMemory.trim()) {
        userMessage += `\n\n[User's preferred style/aesthetic: ${styleMemory}]`;
    }

    return {
        systemPrompt: finalSystemPrompt,
        userMessage,
        detectedMode,
        deterministicLock: isInfoQuery ? null : DETERMINISTIC_LOCKS[detectedMode],
        wordCount,
        compressionOnly: false,
        maxExpansionRatio: isInfoQuery ? 1.5 : null
    };
}
