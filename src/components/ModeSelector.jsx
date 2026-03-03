import { useState } from 'react';
import { MODES } from '../config/systemPrompts';

export default function ModeSelector({ selectedMode, onModeChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const current = MODES.find(m => m.id === selectedMode) || MODES[0];

    return (
        <div className="relative">
            {/* Unified Dropdown */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl pill-active transition-all"
            >
                <span className="text-base lg:text-lg">{current.icon}</span>
                <span className="text-sm lg:text-[14px] font-semibold">{current.label}</span>
                <svg className={`w-3.5 h-3.5 ml-1 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute z-50 mt-2 w-56 lg:w-64 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 rounded-xl bg-[#222926] border border-[rgba(91,146,121,0.12)] shadow-xl animate-fade-in-scale overflow-hidden max-h-[60vh] overflow-y-auto hide-scrollbar">
                        {MODES.map((mode) => (
                            <button
                                key={mode.id}
                                onClick={() => { onModeChange(mode.id); setIsOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200
                  ${selectedMode === mode.id
                                        ? 'bg-[rgba(91,146,121,0.12)] text-green-light'
                                        : 'text-text-secondary hover:bg-[rgba(91,146,121,0.06)] hover:text-cream'}`}
                            >
                                <span className="text-lg">{mode.icon}</span>
                                <div>
                                    <span className="text-sm font-medium block">{mode.label}</span>
                                    <span className="text-[11px] text-text-muted">{mode.description}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
