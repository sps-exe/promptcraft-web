import { useState, useEffect } from 'react';

const MODES = ['auto', 'image', 'code', 'writing', 'email', 'analytical', 'video', 'persona', 'chat'];

const MODE_LABELS = {
    auto: 'Auto', image: 'Image', code: 'Code', writing: 'Writing',
    email: 'Email', analytical: 'Analytical', video: 'Video', persona: 'Persona', chat: 'Chat',
};

export default function StyleMemory({ activeMode, styleMemories, onStyleChange, enabled, onToggle }) {
    const currentMode = activeMode || 'auto';
    const currentStyle = styleMemories?.[currentMode] || '';
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState(currentStyle);
    const [selectedMode, setSelectedMode] = useState(currentMode);

    useEffect(() => {
        const newStyle = styleMemories?.[selectedMode] || '';
        setDraft(newStyle);
        setIsEditing(false);
    }, [selectedMode, styleMemories]);

    // Sync selected mode when active mode changes (e.g. after auto-detect)
    useEffect(() => { setSelectedMode(currentMode); }, [currentMode]);

    const hasAnyStyle = Object.values(styleMemories || {}).some(s => s.trim());

    return (
        <div className="rounded-2xl bg-[rgba(42,50,45,0.4)] border border-[rgba(91,146,121,0.08)] p-5 sm:p-6 transition-all hover:border-[rgba(91,146,121,0.15)]">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <span className="text-lg">🎨</span>
                    <h3 className="text-[15px] font-bold text-cream">Style Memory</h3>
                    {enabled && hasAnyStyle && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-[rgba(91,146,121,0.12)] text-green-light">On</span>}
                </div>
                {hasAnyStyle && (
                    <button onClick={() => onToggle(!enabled)} className={`relative w-11 h-6 rounded-full transition-all duration-300 cursor-pointer ${enabled ? 'bg-green-accent' : 'bg-[rgba(91,146,121,0.15)]'}`}>
                        <span className={`absolute top-[3px] w-4.5 h-4.5 rounded-full transition-all duration-300 ${enabled ? 'left-[23px] bg-white' : 'left-[3px] bg-text-muted'}`} />
                    </button>
                )}
            </div>
            <p className="text-[13px] text-text-muted/50 mb-3">Style applied per mode during enhancement.</p>

            {/* Mode tabs */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {MODES.map(m => {
                    const hasStyle = !!(styleMemories?.[m]?.trim());
                    return (
                        <button
                            key={m}
                            onClick={() => setSelectedMode(m)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer relative ${selectedMode === m
                                    ? 'bg-[rgba(91,146,121,0.2)] text-green-light border border-[rgba(91,146,121,0.3)]'
                                    : 'text-text-muted/60 hover:text-cream border border-transparent hover:border-[rgba(91,146,121,0.1)]'
                                }`}
                        >
                            {MODE_LABELS[m]}
                            {hasStyle && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-accent" />}
                        </button>
                    );
                })}
            </div>

            {/* Editor for selected mode */}
            {isEditing ? (
                <div className="space-y-3 animate-fade-in">
                    <textarea
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        placeholder={`Style for ${MODE_LABELS[selectedMode]} mode, e.g. "Dark cinematic, high contrast"`}
                        className="w-full h-20 p-4 rounded-xl bg-[rgba(26,30,28,0.6)] border border-[rgba(91,146,121,0.08)] text-[15px] text-cream resize-none placeholder:text-text-muted/30"
                    />
                    <div className="flex gap-2.5">
                        <button
                            onClick={() => { onStyleChange(selectedMode, draft); setIsEditing(false); }}
                            className="flex-1 py-3 rounded-xl bg-[rgba(91,146,121,0.12)] text-green-light text-[14px] font-bold hover:bg-[rgba(91,146,121,0.2)] transition-all cursor-pointer"
                        >Save for {MODE_LABELS[selectedMode]}</button>
                        <button onClick={() => { setDraft(styleMemories?.[selectedMode] || ''); setIsEditing(false); }} className="px-5 py-3 rounded-xl text-text-muted text-[14px] hover:text-cream transition-all cursor-pointer">Cancel</button>
                    </div>
                </div>
            ) : (
                <div>
                    {draft && (
                        <div className="p-4 rounded-xl bg-[rgba(26,30,28,0.4)] mb-4">
                            <p className="text-[14px] text-text-secondary italic font-light leading-relaxed">"{draft}"</p>
                        </div>
                    )}
                    <div className="flex gap-2.5">
                        <button onClick={() => setIsEditing(true)} className="flex-1 py-3 rounded-xl bg-[rgba(91,146,121,0.06)] text-text-secondary text-[14px] font-semibold hover:text-green-light transition-all cursor-pointer">
                            {draft ? `✎ Edit ${MODE_LABELS[selectedMode]} Style` : `+ Set ${MODE_LABELS[selectedMode]} Style`}
                        </button>
                        {draft && (
                            <button onClick={() => { onStyleChange(selectedMode, ''); setDraft(''); }} className="px-5 py-3 rounded-xl text-text-muted text-[14px] hover:text-red-400 transition-all cursor-pointer hover:bg-[rgba(239,68,68,0.05)]">Clear</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
