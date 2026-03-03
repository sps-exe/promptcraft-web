import { useRef, useEffect } from 'react';

export default function PromptEditor({ value, onChange, onEnhance, isLoading, charCount }) {
    const textareaRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [value]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onEnhance();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-green-accent animate-breathe" />
                    <h3 className="text-[13px] font-bold text-text-secondary uppercase tracking-[0.12em]">Your Idea</h3>
                </div>
                <span className="text-[12px] font-mono text-text-muted">{charCount} chars</span>
            </div>

            {/* Textarea — fills available space */}
            <div className="focus-glow rounded-2xl border border-[rgba(91,146,121,0.08)] flex-1 min-h-0">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you want to create..."
                    className="w-full h-full p-5 sm:p-6 rounded-2xl bg-[rgba(26,30,28,0.6)] text-cream text-[16px] leading-[1.8] resize-none placeholder:text-text-muted/50 border-none"
                    disabled={isLoading}
                    id="prompt-input"
                />
            </div>

            {/* Enhance Button — bigger */}
            <div className="mt-5 flex items-center gap-3">
                <button
                    onClick={onEnhance}
                    disabled={isLoading || !value.trim()}
                    id="enhance-button"
                    className={`flex-1 flex items-center justify-center gap-3 py-4 sm:py-[18px] px-8 rounded-2xl font-extrabold text-[16px] tracking-wider text-white transition-all duration-300 cursor-pointer
            ${isLoading || !value.trim()
                            ? 'bg-[rgba(42,50,45,0.5)] text-text-muted cursor-not-allowed'
                            : 'glow-button'}`}
                >
                    {isLoading ? (
                        <>
                            <span className="tracking-[0.2em] text-[15px]">ENHANCING</span>
                            <div className="loading-dots">
                                <span /><span /><span />
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="text-lg">✦</span>
                            <span>ENHANCE</span>
                        </>
                    )}
                </button>
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-text-muted/40 font-mono">
                    <kbd className="px-2 py-1 rounded-lg bg-[rgba(91,146,121,0.06)] border border-[rgba(91,146,121,0.08)] text-[11px] font-bold">⌘</kbd>
                    <span>+</span>
                    <kbd className="px-2 py-1 rounded-lg bg-[rgba(91,146,121,0.06)] border border-[rgba(91,146,121,0.08)] text-[11px] font-bold">↵</kbd>
                </div>
            </div>
        </div>
    );
}
