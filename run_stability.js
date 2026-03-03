import { enhancePrompt } from './src/services/groqService.js';
import fs from 'fs';

const API_KEY = "YOUR_GROQ_API_KEY";

// Load previous results
const results = JSON.parse(fs.readFileSync('/tmp/audit_results.json', 'utf-8'));

// Pick: Strong = C1, Messy = D1, Overloaded = B1
const toReprocess = [
    { ...results.find(r => r.id === 'C1'), tier: 'STRONG' },
    { ...results.find(r => r.id === 'D1'), tier: 'MESSY' },
    { ...results.find(r => r.id === 'B1'), tier: 'OVERLOADED' },
];

function estimateTokenExpansion(t1, t2) {
    const t1Tokens = t1.split(/\s+/).length;
    const t2Tokens = t2.split(/\s+/).length;
    return { t1Tokens, t2Tokens, delta: t2Tokens - t1Tokens, pct: ((t2Tokens - t1Tokens) / t1Tokens * 100).toFixed(0) };
}

function detectLockStacked(t1, t2) {
    const lockStr = 'Output must contain only';
    const emailLock = 'Provide only the rewritten email';
    const imageLock = 'Provide only the final optimized image prompt';
    const count = (text) => (text.match(new RegExp(lockStr + '|' + emailLock + '|' + imageLock, 'g')) || []).length;
    return count(t2) > count(t1);
}

const stabilityResults = [];

console.log("=== REPROCESSING STABILITY TEST ===\n");

for (const item of toReprocess) {
    console.log(`Re-processing [${item.tier}] ${item.label}...`);
    try {
        const pass2 = await enhancePrompt(item.enhancedText, 'auto', '', API_KEY);
        const tok = estimateTokenExpansion(item.enhancedText, pass2.text);
        const lockStacked = detectLockStacked(item.enhancedText, pass2.text);

        // Determine stability
        let stability;
        const pct = Math.abs(parseInt(tok.pct));
        if (pct < 10 && !lockStacked) stability = 'Stable';
        else if (pct < 25 || lockStacked) stability = 'Minor Drift';
        else stability = 'Major Drift';

        stabilityResults.push({
            id: item.id,
            tier: item.tier,
            label: item.label,
            pass1Tokens: tok.t1Tokens,
            pass2Tokens: tok.t2Tokens,
            tokenDelta: tok.delta,
            tokenGrowthPct: tok.pct,
            deterministicLocksStacked: lockStacked,
            stability,
            pass2Mode: pass2.detectedMode,
            pass2Text: pass2.text
        });
        console.log(`  Done. Stability=${stability}, TokenDelta=${tok.delta} (${tok.pct}%), Locks Stacked=${lockStacked}`);
    } catch (e) {
        console.error(`  Error: ${e.message}`);
        stabilityResults.push({ id: item.id, tier: item.tier, label: item.label, error: e.message });
    }
}

fs.writeFileSync('/tmp/stability_results.json', JSON.stringify(stabilityResults, null, 2));
console.log("\n=== STABILITY TEST COMPLETE. Results saved to /tmp/stability_results.json ===");
