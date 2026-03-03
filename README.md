# PromptCraft Elite ✦

> **A production-grade AI prompt engineering system.**  
> Turn raw ideas into precision-engineered prompts in one click.

![Stack](https://img.shields.io/badge/React-Vite-61DAFB?style=flat&logo=react) ![Groq](https://img.shields.io/badge/Groq-LLaMA%203.3%2070B-orange?style=flat) ![License](https://img.shields.io/badge/license-MIT-green?style=flat)

---

## What It Does

PromptCraft Elite is an intelligent prompt enhancer with a 9-layer enhancement pipeline. It doesn't just "rewrite" prompts — it classifies intent, selects the optimal mode, applies mode-specific constraints, and runs internal validation before output.

---

## Features

### 🧠 Intelligent Pipeline
```
User Prompt
→ Missing Document Interceptor (JS hard block)
→ Multi-Task Collision Detector (JS hard block)
→ Injection Resistance Check
→ Intent Classifier (Micro-Intent Heuristics)
→ Mode Router (8 modes)
→ Constraint Injector
→ Anti-Hallucination Guard
→ Adaptive Intelligence Layer
→ Precision Layer
→ SESA v1.0 (Self-Evaluation & Stability Assurance)
→ SMP Hard Cap (60-token JS enforcement)
→ Token Inflation Guard (15x cap)
→ Final Output
```

### 🎯 8 Enhancement Modes
| Mode | Best For | Temp |
|---|---|---|
| **Auto** | Detects intent automatically | — |
| **Code** | Python, JS, algorithms | 0.2 |
| **Image** | Midjourney, DALL-E, Stable Diffusion | 0.75 |
| **Writing** | Creative, fiction, poetry | 0.9 |
| **Email** | Professional correspondence | 0.4 |
| **Analytical** | Research, analysis, reports | 0.3 |
| **Video** | Sora, RunwayML prompts | 0.75 |
| **Persona** | Character/role-play instructions | 0.7 |
| **Chat** | General conversation | 0.6 |

### 🔒 Hardening Features
- **Missing Document Interceptor** — Blocks `"improve this X"` without content. No hallucination.
- **Multi-Task Collision Detector** — Detects chained requests and asks for clarification.
- **SMP Hard Cap** — Short/ambiguous prompts are hard-capped at 60 tokens via JavaScript.
- **Token Inflation Guard** — Prompts under 10 words are capped at 15× expansion with auto-compression.
- **Reprocessing Stabilizer** — Already-structured inputs switch to compression-only mode.

### ✨ UX Features
- **Real-time streaming** — See the prompt being built word by word
- **Word-level diff view** — Green = added, red = removed, side-by-side comparison
- **Quality score badge** — Mode, word count, expansion % shown after each run
- **Per-mode Style Memory** — Save a different aesthetic per mode (e.g., "dark cinematic" for image, "formal" for email)
- **Recent history** — Last 10 runs auto-logged without saving
- **Copy as Markdown** — Export original + enhanced as a clean `.md` block
- **⌘+Enter shortcut** — Keyboard-native workflow
- **Fallback model** — Auto-switches to `llama-3.1-8b-instant` on rate limit

---

## Setup

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

### Install

```bash
git clone https://github.com/yourusername/promptcraft-elite
cd promptcraft-elite
npm install
```

### Configure

```bash
# Option 1: .env file (recommended)
echo "VITE_GROQ_API_KEY=your_key_here" > .env

# Option 2: Add key in the app settings panel (gear icon)
```

### Run

```bash
npm run dev       # Development server at http://localhost:5173
npm run build     # Production build
```

---

## Architecture

```
src/
├── services/
│   ├── groqService.js        # API client, streaming, fallback, post-processing
│   ├── promptEngine.js       # JS interceptors, system prompt assembly
│   ├── intentClassifier.js   # Mode detection + Micro-Intent Heuristics
│   └── storageService.js     # localStorage (prompts, style memory, API key)
├── config/
│   └── systemPrompts.js      # All LLM instruction layers (SESA, Precision, AIL...)
└── components/
    ├── PromptEditor.jsx       # Input with Cmd+Enter
    ├── EnhancedOutput.jsx     # Output with quality badge + diff toggle
    ├── DiffView.jsx           # Word-level LCS diff visualization
    ├── ModeSelector.jsx       # Mode pills
    ├── StyleMemory.jsx        # Per-mode style persistence
    ├── SavedPrompts.jsx       # Saved + Recent tabs with markdown export
    └── SettingsPanel.jsx      # API key management
```

---

## Models Used

| Purpose | Model |
|---|---|
| Primary enhancement | `llama-3.3-70b-versatile` |
| Fallback (rate limit) | `llama-3.1-8b-instant` |
| Compression passes | `llama-3.1-8b-instant` |

All via [Groq](https://groq.com) — free tier is sufficient for personal use.

---

## License

MIT — free to use, modify, and deploy.
