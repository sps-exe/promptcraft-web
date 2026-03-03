import { useState } from 'react';
import DiffView from './DiffView';

const MODE_ICONS = {
    code: '⟨/⟩',
    image: '◈',
    video: '▶',
    writing: '✍',
    email: '✉',
    analytical: '◎',
    persona: '◉',
    chat: '◇',
    auto: '✦',
};

const MODE_COLORS = {
    code: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
    image: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    video: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    writing: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    email: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    analytical: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
    persona: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    chat: 'text-green-400 bg-green-400/10 border-green-400/20',
};

export default function EnhancedOutput({ enhanced, isLoading, onSave, mode, stats, originalPrompt }) {
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleCopy = async () => {
        if (!enhanced) return;
        try { await navigator.clipboard.writeText(enhanced); }
        catch { const t = document.createElement('textarea'); t.value = enhanced; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSave = () => {
        if (!enhanced) return;
        const result = onSave();
        if (result?.success) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    };

    const modeColor = MODE_COLORS[mode] || MODE_COLORS.chat;
    const modeIcon = MODE_ICONS[mode] || '◇';

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${enhanced ? 'bg-green-accent' : 'bg-text-muted/30'}`} />
                    <h3 className="text-[13px] font-bold text-text-secondary uppercase tracking-[0.12em]">Enhanced Prompt</h3>
                </div>

                {/* ── Improvement #5: Quality Score Row ── */}
                <div className="flex items-center gap-2">
                    {stats && enhanced && !isLoading && (
                        <>
                            {/* Mode badge */}
                            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${modeColor}`}>
                                <span>{modeIcon}</span>
                                <span className="uppercase tracking-wider">{mode}</span>
                            </span>
                            {/* Word count */}
                            <span className="text-[11px] font-mono text-text-muted/60">
                                {stats.originalWords}→{stats.enhancedWords}w
                            </span>
                            {/* Expansion % */}
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stats.expansionPct > 200
                                ? 'text-amber-400 bg-amber-400/10'
                                : 'text-green-light/70 bg-green-accent/10'
                                }`}>
                                +{stats.expansionPct}%
                            </span>
                        </>
                    )}
                    {!stats && (
                        <span className="text-[12px] font-mono text-text-muted">{enhanced ? enhanced.length : 0} chars</span>
                    )}
                </div>
            </div>

            {/* Output — fills height */}
            <div className={`flex-1 min-h-0 rounded-2xl border transition-all duration-500 overflow-y-auto ${enhanced
                ? 'bg-[rgba(42,50,45,0.4)] border-[rgba(91,146,121,0.15)]'
                : 'bg-[rgba(26,30,28,0.4)] border-[rgba(91,146,121,0.06)]'
                }`}>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
                        <div className="w-12 h-12 rounded-full border-2 border-green-accent/20 border-t-green-accent" style={{ animation: 'spin 1s linear infinite' }} />
                        <div className="text-center">
                            <p className="text-[15px] text-text-secondary font-medium mb-2">Crafting your prompt</p>
                            <div className="loading-dots justify-center">
                                <span /><span /><span />
                            </div>
                        </div>
                    </div>
                ) : enhanced ? (
                    <div className="p-5 sm:p-6 animate-fade-in">
                        <p className="text-[16px] leading-[1.8] text-cream/90 whitespace-pre-wrap">{enhanced}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6">
                        <span className="text-4xl animate-float opacity-15 mb-3">✦</span>
                        <p className="text-[15px] text-text-muted/40">Enhanced prompt appears here</p>
                    </div>
                )}
            </div>

            {/* Diff view */}
            {enhanced && originalPrompt && !isLoading && (
                <DiffView original={originalPrompt} enhanced={enhanced} />
            )}

            {/* Action buttons */}
            {enhanced && !isLoading && (
                <div className="mt-5 flex items-center gap-3 animate-fade-in">
                    <button
                        onClick={handleCopy}
                        id="copy-button"
                        className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 sm:py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 cursor-pointer border ${copied
                            ? 'bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.15)] text-green-accent'
                            : 'bg-[rgba(91,146,121,0.04)] border-[rgba(91,146,121,0.1)] text-text-secondary hover:text-green-light hover:border-[rgba(91,146,121,0.2)]'
                            }`}
                    >
                        <span className="text-lg">{copied ? '✓' : '⎘'}</span>
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                        onClick={handleSave}
                        id="save-button"
                        className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 sm:py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 cursor-pointer border ${saved
                            ? 'bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.15)] text-green-accent'
                            : 'bg-[rgba(91,146,121,0.04)] border-[rgba(91,146,121,0.1)] text-text-secondary hover:text-skin-dark hover:border-[rgba(212,184,150,0.2)]'
                            }`}
                    >
                        <span className="text-lg">{saved ? '✓' : '◈'}</span>
                        <span>{saved ? 'Saved!' : 'Save'}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
