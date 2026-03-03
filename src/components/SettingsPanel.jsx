import { useState, useEffect } from 'react';

export default function SettingsPanel({ apiKey, onApiKeyChange, isOpen, onClose }) {
    const [key, setKey] = useState(apiKey);
    const [showKey, setShowKey] = useState(false);
    useEffect(() => { setKey(apiKey); }, [apiKey]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <div className="relative w-full max-w-lg rounded-[28px] bg-[#222926] border border-[rgba(91,146,121,0.15)] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] animate-fade-in-scale" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-cream flex items-center gap-4">
                        <span className="w-12 h-12 rounded-2xl bg-[rgba(91,146,121,0.12)] flex items-center justify-center text-2xl shadow-inner border border-[rgba(91,146,121,0.1)]">⚙</span>
                        Configuration
                    </h2>
                    <button onClick={onClose} className="p-3 rounded-xl text-text-muted hover:text-cream hover:bg-[rgba(91,146,121,0.06)] transition-all cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <label className="text-base font-bold text-text-secondary block">Groq API Key</label>
                    <div className="relative group">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={key}
                            onChange={e => setKey(e.target.value)}
                            placeholder="gsk_..."
                            className="w-full px-5 py-4 pr-20 rounded-2xl bg-[rgba(26,30,28,0.8)] border border-[rgba(91,146,121,0.12)] text-[16px] text-cream font-mono placeholder:text-text-muted/30 focus:border-[rgba(91,146,121,0.3)] focus:ring-4 focus:ring-[rgba(91,146,121,0.1)] transition-all shadow-inner"
                            id="api-key-input"
                        />
                        <button
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-bold text-text-muted hover:text-cream bg-[rgba(26,30,28,0.9)] px-3 py-1.5 rounded-lg border border-[rgba(91,146,121,0.1)] transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                        >
                            {showKey ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    <p className="text-[13px] text-text-muted/60 leading-relaxed mt-2 pl-1">
                        Required for prompt enhancement. Get your free key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-green-accent/90 hover:text-green-light font-medium underline underline-offset-4 decoration-[rgba(91,146,121,0.3)] hover:decoration-green-light transition-all">console.groq.com</a>
                    </p>
                </div>

                <div className="mt-10 flex gap-4">
                    <button onClick={() => { onApiKeyChange(key.trim()); onClose(); }} className="flex-1 py-4 rounded-2xl glow-button text-[16px] font-bold tracking-wide text-white cursor-pointer shadow-lg">Save Configuration</button>
                    <button onClick={onClose} className="px-8 py-4 rounded-2xl bg-[rgba(91,146,121,0.06)] border border-[rgba(91,146,121,0.1)] text-text-secondary text-[16px] font-bold hover:text-cream hover:bg-[rgba(91,146,121,0.1)] hover:border-[rgba(91,146,121,0.2)] transition-all cursor-pointer">Cancel</button>
                </div>
            </div>
        </div>
    );
}
