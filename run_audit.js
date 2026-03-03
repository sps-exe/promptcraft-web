import { enhancePrompt } from './src/services/groqService.js';
import { classifyIntent } from './src/services/intentClassifier.js';
import fs from 'fs';

const API_KEY = "YOUR_GROQ_API_KEY";

const testCases = [
    // A. Cross-Mode Collision
    { id: "A1", label: "Cross-Mode Collision 1", prompt: "Create a cinematic 8K render of a neural network city. Also provide a Python function that generates a graph adjacency list." },
    { id: "A2", label: "Cross-Mode Collision 2", prompt: "Write a dramatic apology email to my professor about missing an exam due to a time-travel experiment malfunction." },
    { id: "A3", label: "Cross-Mode Collision 3", prompt: "reverse it but safer and optimized" },

    // B. Constraint Saturation
    { id: "B1", label: "Constraint Saturation", prompt: "Write a 250-word essay with exactly 3 sections, 2 bullet lists, include 1 metaphor, 2 statistics, no adjectives, formal tone, persuasive style, beginner-friendly, include conclusion, no repetition." },

    // C. Perfect Prompt Stability
    { id: "C1", label: "Perfect Prompt Stability", prompt: "Cyberpunk inflation visual, neon-lit, dutch tilt, 8K resolution, high-contrast lighting, 16:9 aspect ratio, shallow depth of field." },

    // D. Ambiguity Edge Cases
    { id: "D1", label: "Ambiguity - make it better", prompt: "make it better" },
    { id: "D2", label: "Ambiguity - professional tone", prompt: "professional tone please" },
    { id: "D3", label: "Ambiguity - missing content", prompt: "Improve this contract and make it legally stronger." },

    // E. Multi-Task Chaos
    { id: "E1", label: "Multi-Task Chaos", prompt: "Write a poem about AI. Also summarize quantum computing in 100 words. Also create a logo concept." },

    // F. Minimal High-Signal Image Prompt
    { id: "F1", label: "Minimal High-Signal Image", prompt: "8K dystopian inflation, neon decay, dutch tilt, 16:9" },
];

function estimateTokenExpansion(original, enhanced) {
    const origTokens = original.split(/\s+/).length;
    const enhTokens = enhanced.split(/\s+/).length;
    const pct = ((enhTokens - origTokens) / origTokens * 100).toFixed(0);
    return { origTokens, enhTokens, pct };
}

function detectAssumption(text) {
    return text.toLowerCase().includes('assumption:');
}

function detectClarification(text) {
    return text.toLowerCase().includes("let's clarify") || text.toLowerCase().includes('please provide') || text.toLowerCase().includes('request clarification');
}

function detectLock(text) {
    return text.includes('Output must contain') || text.includes('Provide only') || text.includes('Do not include commentary') || text.includes('Do not include explanations');
}

const results = [];

console.log("=== RUNNING ADVERSARIAL STRESS AUDIT ===\n");

for (const tc of testCases) {
    console.log(`Running [${tc.id}]: ${tc.label}...`);
    try {
        const detectedMode = classifyIntent(tc.prompt);
        const result = await enhancePrompt(tc.prompt, 'auto', '', API_KEY);
        const { origTokens, enhTokens, pct } = estimateTokenExpansion(tc.prompt, result.text);
        const assumptionTriggered = detectAssumption(result.text);
        const clarificationRequested = detectClarification(result.text);
        const lockApplied = detectLock(result.text);

        results.push({
            ...tc,
            detectedMode: result.detectedMode,
            enhancedText: result.text,
            origTokens,
            enhTokens,
            tokenExpansionPct: pct,
            assumptionTriggered,
            clarificationRequested,
            lockApplied,
        });
        console.log(`  Done. Mode=${result.detectedMode}, Expansion=${pct}%, Assumption=${assumptionTriggered}, Clarify=${clarificationRequested}`);
    } catch (e) {
        console.error(`  Error on ${tc.id}: ${e.message}`);
        results.push({ ...tc, error: e.message });
    }
}

// Write raw results to JSON for the audit doc generator
fs.writeFileSync('/tmp/audit_results.json', JSON.stringify(results, null, 2));
console.log("\n=== ALL TESTS COMPLETE. Results saved to /tmp/audit_results.json ===");
