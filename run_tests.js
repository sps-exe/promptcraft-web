import { enhancePrompt } from './src/services/groqService.js';

const API_KEY = "YOUR_GROQ_API_KEY";

const finalChallenge = [
    { id: 1, label: "Missing Document Hard Block", prompt: "Improve this contract." },
    { id: 2, label: "SMP Hard Cap", prompt: "make it better" },
    { id: 3, label: "Ambiguous Short + Code", prompt: "reverse it" },
    { id: 4, label: "Multi-Task Collision", prompt: "Create a cinematic neural network city. Also provide a Python function for a graph adjacency list." },
    { id: 5, label: "Minimal High-Signal Image", prompt: "8K neon inflation dutch tilt 16:9" },
];

console.log("=== HARDENING PATCH v1.0 — FINAL 5-PROMPT CHALLENGE ===\n");

for (const tc of finalChallenge) {
    console.log(`\n[${tc.id}] ${tc.label}`);
    console.log(`INPUT: "${tc.prompt}"`);
    try {
        const result = await enhancePrompt(tc.prompt, 'auto', '', API_KEY);
        const outputWords = result.text.trim().split(/\s+/).length;
        console.log(`MODE: ${result.detectedMode}`);
        console.log(`OUTPUT WORDS: ${outputWords}`);
        console.log(`OUTPUT:\n${result.text}`);
    } catch (e) {
        console.error(`ERROR: ${e.message}`);
    }
    console.log(`\n${'─'.repeat(60)}`);
}
