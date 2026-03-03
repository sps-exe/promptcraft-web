import { useState, useEffect, useCallback } from 'react';
import ModeSelector from './components/ModeSelector';
import PromptEditor from './components/PromptEditor';
import EnhancedOutput from './components/EnhancedOutput';
import SavedPrompts from './components/SavedPrompts';
import StyleMemory from './components/StyleMemory';
import SettingsPanel from './components/SettingsPanel';
import { enhancePrompt } from './services/groqService';
import {
  getSavedPrompts, savePrompt, deletePrompt,
  getAllStyleMemories, setStyleMemoryForMode,
  isStyleMemoryEnabled, setStyleMemoryEnabled,
  getApiKey, setApiKey as saveApiKey,
} from './services/storageService';

export default function App() {
  const [mode, setMode] = useState('auto');
  const [input, setInput] = useState('');
  const [enhanced, setEnhanced] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const [styleMemories, setStyleMemoriesState] = useState({});
  const [styleEnabled, setStyleEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKeyState] = useState('');
  const [enhanceStats, setEnhanceStats] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);

  useEffect(() => {
    setSavedPrompts(getSavedPrompts());
    setStyleMemoriesState(getAllStyleMemories());
    setStyleEnabled(isStyleMemoryEnabled());
    setApiKeyState(getApiKey());
  }, []);

  const handleEnhance = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const key = apiKey || import.meta.env.VITE_GROQ_API_KEY;
    if (!key) { setShowSettings(true); setError('Add your Groq API key in Settings.'); return; }
    setIsLoading(true); setError(''); setEnhanced(''); setEnhanceStats(null);
    try {
      // Get mode-specific style: use detected/selected mode, fall back to 'auto'
      const styleForMode = styleEnabled ? (styleMemories[mode] || styleMemories['auto'] || '') : '';
      let streamedText = '';
      const result = await enhancePrompt(
        input, mode, styleForMode, key,
        (chunk) => {
          streamedText += chunk;
          setEnhanced(streamedText);
        }
      );
      // Once done, set final processed text (post-processing may modify it)
      setEnhanced(result.text);
      setEnhanceStats(result.stats);
      if (mode === 'auto') { setMode(result.detectedMode); }
      // Auto-log to recent history (last 10, in memory only)
      const historyEntry = {
        id: `recent-${Date.now()}`,
        original: input,
        enhanced: result.text,
        mode: result.detectedMode || mode,
        timestamp: new Date().toISOString(),
        label: input.slice(0, 60),
      };
      setRecentHistory(prev => [historyEntry, ...prev].slice(0, 10));
    } catch (err) { setError(err.message); }
    finally { setIsLoading(false); }
  }, [input, mode, isLoading, apiKey, styleEnabled, styleMemories]);

  const handleSave = useCallback(() => {
    const r = savePrompt({ original: input, enhanced, mode });
    if (r.success) setSavedPrompts(getSavedPrompts());
    else setError(r.error);
    return r;
  }, [input, enhanced, mode]);

  const handleDelete = useCallback((id) => setSavedPrompts(deletePrompt(id)), []);
  const handleStyleChange = useCallback((modeKey, style) => {
    setStyleMemoryForMode(modeKey, style);
    setStyleMemoriesState(getAllStyleMemories());
  }, []);
  const handleStyleToggle = useCallback((e) => { setStyleMemoryEnabled(e); setStyleEnabled(e); }, []);
  const handleApiKeyChange = useCallback((k) => { saveApiKey(k); setApiKeyState(k); setError(''); }, []);

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="aurora-bg" />
      <div className="grain-overlay" />

      {/* Content — fills entire viewport */}
      <div className="relative z-10 flex flex-col h-full">

        {/* ══ HEADER ══ */}
        <header className="flex-shrink-0 header-blur z-40">
          <div className="w-full px-5 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between h-[60px] sm:h-[68px]">
              {/* Logo */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <img src="/logo.png" alt="PromptCraft" className="w-10 h-10 rounded-xl object-cover" />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-extrabold gradient-text leading-none">PromptCraft</h1>
                  <p className="text-[10px] text-text-muted/50 font-semibold tracking-[0.18em] uppercase mt-0.5">Prompt Enhancer</p>
                </div>
              </div>

              {/* Mode Selector */}
              <div className="flex-1 flex justify-center px-4">
                <ModeSelector selectedMode={mode} onModeChange={setMode} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {styleEnabled && Object.values(styleMemories).some(Boolean) && (
                  <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-[rgba(91,146,121,0.08)] text-green-light/60 border border-[rgba(91,146,121,0.1)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-accent/60 animate-breathe" />Style
                  </span>
                )}
                <button onClick={() => setShowSidebar(!showSidebar)} className="relative p-3 rounded-xl text-text-muted hover:text-cream hover:bg-[rgba(91,146,121,0.06)] transition-all cursor-pointer" id="toggle-sidebar">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  {savedPrompts.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-green-accent text-[9px] font-bold text-white flex items-center justify-center">{savedPrompts.length}</span>
                  )}
                </button>
                <button onClick={() => setShowSettings(true)} className="p-3 rounded-xl text-text-muted hover:text-cream hover:bg-[rgba(91,146,121,0.06)] transition-all cursor-pointer group" id="settings-button">
                  <svg className="w-5 h-5 transition-transform duration-500 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ══ MAIN — stretches to fill remaining viewport ══ */}
        <main className="flex-1 min-h-0 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          {/* Error */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.1)] text-red-400/80 text-[15px] animate-fade-in flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-red-400/40 hover:text-red-400 cursor-pointer ml-4 text-xl">×</button>
            </div>
          )}

          {/* Panels — fill remaining height */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 h-full min-h-0">
            <div className="glass-card p-6 sm:p-8 flex flex-col min-h-0">
              <PromptEditor value={input} onChange={setInput} onEnhance={handleEnhance} isLoading={isLoading} charCount={input.length} />
            </div>
            <div className="glass-card p-6 sm:p-8 flex flex-col min-h-0">
              <EnhancedOutput enhanced={enhanced} isLoading={isLoading} onSave={handleSave} mode={mode} stats={enhanceStats} originalPrompt={input} />
            </div>
          </div>
        </main>

        {/* ══ FOOTER — minimal ══ */}
        <footer className="flex-shrink-0 py-3 text-center">
          <p className="text-[10px] text-text-muted/20 font-medium tracking-[0.15em] uppercase">PromptCraft · Powered by Groq · Free Forever</p>
        </footer>
      </div>

      {/* ══ SIDEBAR ══ */}
      {showSidebar && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
          <aside className="fixed top-0 right-0 z-50 h-full w-full sm:w-[460px] bg-[rgba(26,30,28,0.97)] backdrop-blur-xl border-l border-[rgba(91,146,121,0.06)] overflow-y-auto animate-slide-in shadow-2xl">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[22px] font-bold text-cream tracking-wide">Library</h2>
                <button onClick={() => setShowSidebar(false)} className="p-3 rounded-xl text-text-muted hover:text-cream hover:bg-[rgba(91,146,121,0.08)] transition-all cursor-pointer">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="mb-8"><StyleMemory activeMode={mode} styleMemories={styleMemories} onStyleChange={handleStyleChange} enabled={styleEnabled} onToggle={handleStyleToggle} /></div>
              <div className="h-px bg-[rgba(91,146,121,0.08)] mb-6" />
              <h3 className="text-[12px] font-bold text-text-muted/50 uppercase tracking-[0.2em] mb-4 pl-1">Saved Prompts</h3>
              <SavedPrompts prompts={savedPrompts} recentHistory={recentHistory} onDelete={handleDelete} />
            </div>
          </aside>
        </>
      )}

      {/* ══ SETTINGS ══ */}
      <SettingsPanel apiKey={apiKey} onApiKeyChange={handleApiKeyChange} isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
