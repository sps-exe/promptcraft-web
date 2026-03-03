import { useState, useMemo } from 'react';

// Simple word-level diff that marks added/removed/unchanged tokens
function computeDiff(original, enhanced) {
    const origWords = original.trim().split(/(\s+)/);
    const enhWords = enhanced.trim().split(/(\s+)/);

    // Build a simple LCS-based diff
    const m = origWords.length;
    const n = enhWords.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = m - 1; i >= 0; i--)
        for (let j = n - 1; j >= 0; j--)
            dp[i][j] = origWords[i] === enhWords[j]
                ? dp[i + 1][j + 1] + 1
                : Math.max(dp[i + 1][j], dp[i][j + 1]);

    const result = [];
    let i = 0, j = 0;
    while (i < m || j < n) {
        if (i < m && j < n && origWords[i] === enhWords[j]) {
            result.push({ type: 'same', text: origWords[i] });
            i++; j++;
        } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
            result.push({ type: 'add', text: enhWords[j] });
            j++;
        } else {
            result.push({ type: 'remove', text: origWords[i] });
            i++;
        }
    }
    return result;
}

export default function DiffView({ original, enhanced }) {
    const [showDiff, setShowDiff] = useState(false);
    const diff = useMemo(() => showDiff ? computeDiff(original, enhanced) : [], [original, enhanced, showDiff]);

    if (!original || !enhanced) return null;

    return (
        <div className="mt-4">
            <button
                onClick={() => setShowDiff(!showDiff)}
                className="flex items-center gap-2 text-[12px] font-bold text-text-muted/50 hover:text-green-light transition-all cursor-pointer group"
            >
                <span className={`transition-transform duration-300 ${showDiff ? 'rotate-90' : ''}`}>▶</span>
                <span className="uppercase tracking-[0.12em]">{showDiff ? 'Hide' : 'Show'} Diff</span>
                {!showDiff && (
                    <span className="px-1.5 py-0.5 rounded bg-[rgba(91,146,121,0.08)] text-[10px] text-green-light/60">
                        word-level
                    </span>
                )}
            </button>
            {showDiff && (
                <div className="mt-3 p-4 rounded-2xl bg-[rgba(26,30,28,0.6)] border border-[rgba(91,146,121,0.08)] animate-fade-in">
                    <p className="text-[11px] font-bold text-text-muted/40 uppercase tracking-[0.15em] mb-3">
                        Word-Level Changes
                    </p>
                    <div className="text-[14px] leading-[2] text-cream/70 flex flex-wrap gap-x-1">
                        {diff.map((token, idx) => {
                            if (token.type === 'same') {
                                return <span key={idx}>{token.text}</span>;
                            } else if (token.type === 'add') {
                                return (
                                    <span key={idx} className="bg-green-accent/15 text-green-light border border-green-accent/20 rounded px-0.5">
                                        {token.text}
                                    </span>
                                );
                            } else {
                                return (
                                    <span key={idx} className="bg-red-500/10 text-red-400/70 border border-red-500/15 rounded px-0.5 line-through opacity-60">
                                        {token.text}
                                    </span>
                                );
                            }
                        })}
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[rgba(91,146,121,0.06)]">
                        <span className="flex items-center gap-1.5 text-[11px] text-green-light/60">
                            <span className="w-3 h-3 rounded bg-green-accent/20 border border-green-accent/30 inline-block" />
                            Added
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-red-400/50">
                            <span className="w-3 h-3 rounded bg-red-500/15 border border-red-500/20 inline-block" />
                            Removed
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
