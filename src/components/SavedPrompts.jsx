import { useState } from 'react';
import { MODES } from '../config/systemPrompts';

const getModeInfo = (modeId) => MODES.find(m => m.id === modeId) || { icon: '💬', label: modeId };

const formatDate = (ts, now) => {
    const diff = now - new Date(ts);
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
};

function PromptCard({ p, onDelete, copiedId, onCopy, isRecent = false }) {
    const [open, setOpen] = useState(false);
    const mode = getModeInfo(p.mode);
    const now = Date.now();

    const handleCopyMarkdown = async () => {
        const md = `## Original\n${p.original}\n\n## Enhanced\n${p.enhanced}`;
        try { await navigator.clipboard.writeText(md); } catch { /* ignore */ }
        onCopy(p.id + '-md');
    };

    return (
        <div className={`rounded-2xl border transition-all ${isRecent
            ? 'bg-[rgba(42,50,45,0.25)] border-[rgba(91,146,121,0.04)] hover:border-[rgba(91,146,121,0.1)]'
            : 'bg-[rgba(42,50,45,0.35)] border-[rgba(91,146,121,0.06)] hover:border-[rgba(91,146,121,0.15)]'
            }`}>
            <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-3 p-4 sm:p-5 text-left cursor-pointer group">
                <span className="text-lg mt-0.5 group-hover:scale-110 transition-transform">{mode.icon}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-cream/90 line-clamp-2 leading-snug font-medium pb-1">{p.label || p.original}</p>
                    <div className="flex gap-2.5 mt-1.5 opacity-80">
                        <span className="text-[11px] text-text-muted/60 font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[rgba(0,0,0,0.2)]">{mode.label}</span>
                        <span className="text-[11px] text-text-muted/40 py-0.5">{formatDate(p.timestamp, now)}</span>
                        {isRecent && <span className="text-[10px] text-amber-400/50 py-0.5 font-bold">RECENT</span>}
                    </div>
                </div>
                <svg className={`w-4 h-4 text-text-muted/40 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {open && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 animate-fade-in border-t border-[rgba(91,146,121,0.05)] pt-4 mt-1">
                    <div className="p-3.5 rounded-xl bg-[rgba(0,0,0,0.15)] mb-3">
                        <p className="text-[10px] text-text-muted/50 font-bold uppercase tracking-[0.15em] mb-1.5">Original</p>
                        <p className="text-[14px] text-text-secondary/80 leading-relaxed font-light">{p.original}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-[rgba(91,146,121,0.04)] border border-[rgba(91,146,121,0.08)]">
                        <p className="text-[10px] text-green-accent/60 font-bold uppercase tracking-[0.15em] mb-1.5">Enhanced</p>
                        <p className="text-[15px] text-cream/90 leading-relaxed">{p.enhanced}</p>
                    </div>
                    <div className="flex gap-2.5 mt-4">
                        <button onClick={() => onCopy(p.id)} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold bg-[rgba(91,146,121,0.08)] text-text-secondary hover:text-green-light hover:bg-[rgba(91,146,121,0.15)] transition-all cursor-pointer">
                            {copiedId === p.id ? '✓ Copied!' : '⎘ Copy'}
                        </button>
                        <button onClick={handleCopyMarkdown} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold bg-[rgba(91,146,121,0.04)] text-text-secondary hover:text-cream hover:bg-[rgba(91,146,121,0.1)] transition-all cursor-pointer">
                            {copiedId === p.id + '-md' ? '✓ Copied!' : '⌥ Markdown'}
                        </button>
                        {!isRecent && (
                            <button onClick={() => onDelete(p.id)} className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-text-muted hover:text-red-400 hover:bg-[rgba(239,68,68,0.05)] transition-all cursor-pointer">✕</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SavedPrompts({ prompts, recentHistory, onDelete }) {
    const [copiedId, setCopiedId] = useState(null);
    const [tab, setTab] = useState('saved');

    const handleCopy = async (idKey) => {
        const p = [...prompts, ...(recentHistory || [])].find(x => x.id === idKey || x.id + '-md' === idKey);
        if (!p) return;
        const text = idKey.endsWith('-md')
            ? `## Original\n${p.original}\n\n## Enhanced\n${p.enhanced}`
            : p.enhanced;
        try { await navigator.clipboard.writeText(text); } catch { /* ignore */ }
        setCopiedId(idKey);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const hasRecent = recentHistory && recentHistory.length > 0;
    const activeList = tab === 'recent' ? (recentHistory || []) : prompts;

    return (
        <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-5">
                <button
                    onClick={() => setTab('saved')}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer ${tab === 'saved'
                            ? 'bg-[rgba(91,146,121,0.15)] text-green-light border border-[rgba(91,146,121,0.25)]'
                            : 'text-text-muted/60 hover:text-cream'
                        }`}
                >
                    ◈ Saved {prompts.length > 0 && <span className="ml-1 opacity-60">({prompts.length})</span>}
                </button>
                <button
                    onClick={() => setTab('recent')}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer relative ${tab === 'recent'
                            ? 'bg-[rgba(91,146,121,0.15)] text-green-light border border-[rgba(91,146,121,0.25)]'
                            : 'text-text-muted/60 hover:text-cream'
                        }`}
                >
                    ◷ Recent {hasRecent && <span className="ml-1 opacity-60">({recentHistory.length})</span>}
                    {hasRecent && tab !== 'recent' && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-accent animate-breathe" />
                    )}
                </button>
            </div>

            {/* Content */}
            {activeList.length === 0 ? (
                <div className="text-center py-12 px-4">
                    <span className="text-3xl block mb-3 opacity-15">{tab === 'recent' ? '◷' : '◇'}</span>
                    <p className="text-[14px] text-text-muted/50">{tab === 'recent' ? 'No recent runs yet' : 'No saved prompts yet'}</p>
                    <p className="text-[12px] text-text-muted/30 mt-1">{tab === 'recent' ? 'Enhance a prompt to see it here' : 'Enhance a prompt and click Save'}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {tab === 'saved' && (
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[12px] font-mono text-text-muted/50">{prompts.length} / 50 saved</span>
                        </div>
                    )}
                    {activeList.map(p => (
                        <PromptCard
                            key={p.id}
                            p={p}
                            onDelete={onDelete}
                            copiedId={copiedId}
                            onCopy={handleCopy}
                            isRecent={tab === 'recent'}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
