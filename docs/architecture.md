# Architecture

## Overview

Brand-AId is a pre-launch AI campaign simulation engine. Users submit a campaign (copy + optional image + targeting info), and the system runs it through a 6-stage AI pipeline to simulate synthetic audience reactions and forecast performance before real money is spent.

---

## System Diagram

```
User Browser (React)
        │
        │  POST /api/simulate/ (multipart form)
        ▼
FastAPI Backend (port 8000)
        │
        ▼
Simulation Orchestrator
        │
        ├── Stage 1: Campaign Analyzer      (OpenAI multimodal)
        ├── Stage 2+3: Persona Generator    (OpenAI chat)
        ├── Stage 4: Forecast Engine        (OpenAI chat)
        ├── Stage 5: Recommendation Engine  (OpenAI chat)
        └── Stage 6: Re-Simulation          (runs stages 1-4 on optimized copy)
        │
        ▼
ChromaDB (local vector store)       ← RAG layer (lightweight, future use)
        │
        ▼
SimulationResult (JSON) → Frontend
```

---

## Tech Stack

| Layer        | Technology                                              | Notes                                  |
|--------------|---------------------------------------------------------|----------------------------------------|
| Frontend     | React 18, Vite, TypeScript                              | Node 22 required                       |
| Styling      | TailwindCSS v4, shadcn/ui (Radix), tw-animate-css       | Dark theme by default                  |
| Backend      | FastAPI, Python 3.12, Uvicorn                           | Async throughout                       |
| AI           | OpenAI SDK 2.38.0 (AsyncOpenAI)                         | Model names read from .env             |
| Vector DB    | ChromaDB (local)                                        | Committed to git for multi-device sync |
| Embeddings   | OpenAI (model via .env)                                 | Used for RAG retrieval                 |

---

## Directory Structure

```
brand-AId/
├── CLAUDE.md                    # Claude Code rules and quick reference
├── .env                         # Local secrets (gitignored)
├── .env.example                 # Committed template
├── docs/                        # Persistent project context (this folder)
│   ├── architecture.md
│   ├── decisions.md
│   ├── current_status.md
│   ├── workflows.md
│   ├── deployment.md
│   └── backlog.md
├── backend/
│   ├── main.py                  # FastAPI app entrypoint
│   ├── requirements.txt
│   ├── .venv/                   # Python 3.12 venv (gitignored)
│   ├── app/
│   │   ├── core/config.py       # Pydantic Settings (reads .env)
│   │   ├── models/schemas.py    # All Pydantic request/response models
│   │   ├── routes/simulation.py # POST /api/simulate/ endpoint
│   │   └── services/
│   │       ├── openai_client.py            # Shared AsyncOpenAI client
│   │       ├── campaign_analyzer.py        # Stage 1
│   │       ├── persona_generator.py        # Stage 2+3
│   │       ├── forecast_engine.py          # Stage 4
│   │       ├── recommendation_engine.py    # Stage 5
│   │       └── simulation_orchestrator.py  # Wires all stages together
│   ├── data/
│   │   ├── knowledge_base/      # RAG source documents (.txt/.md)
│   │   └── chroma_db/           # ChromaDB vector store (committed)
│   └── uploads/                 # Uploaded campaign images (committed)
└── frontend/
    ├── vite.config.ts           # Vite + Tailwind + path alias (@/)
    ├── components.json          # shadcn/ui config
    ├── src/
    │   ├── App.tsx              # Screen state machine (input/processing/results)
    │   ├── types/index.ts       # All TypeScript types (mirrors backend schemas)
    │   ├── lib/
    │   │   ├── api.ts           # Fetch client → backend
    │   │   └── utils.ts         # shadcn cn() utility
    │   ├── pages/
    │   │   ├── InputPage.tsx    # Campaign submission form (Screen 1)
    │   │   ├── ProcessingPage.tsx # Animated loading (Screen 2)
    │   │   └── ResultsPage.tsx  # Full results display (Screen 3)
    │   └── components/
    │       └── ui/              # shadcn components (button, card, input, etc.)
    └── src/index.css            # Tailwind + shadcn theme variables
```

---

## API Contract

### POST `/api/simulate/`

**Request:** `multipart/form-data`

| Field           | Type   | Required |
|-----------------|--------|----------|
| objective       | string | yes      |
| platform        | string | yes      |
| target_audience | string | yes      |
| budget          | string | yes      |
| ad_copy         | string | yes      |
| image           | file   | no       |

**Response:** `SimulationResult` JSON

```json
{
  "campaign_analysis": { "emotional_tone": "...", "cta_strength": "...", "overall_score": 72, ... },
  "personas": [{ "persona_name": "Alex", "persona_type": "Gen Z", "engagement_likelihood": "High", ... }],
  "forecast": { "ctr_range": "1.2%–2.8%", "roi_direction": "Positive", "confidence_level": "Medium", ... },
  "risks": ["..."],
  "recommendations": { "improved_cta": "...", "optimization_tips": ["..."], ... },
  "optimized_copy": "...",
  "optimized_forecast": { ... }
}
```

---

## Key Design Decisions

See `decisions.md` for full rationale. Summary:
- All AI calls are async (AsyncOpenAI)
- Model names never hardcoded — always from `.env`
- No auth, no DB, no user management in MVP
- ChromaDB committed to git so RAG state syncs across devices
- Re-simulation (Stage 6) runs inline, not on-demand — full result returned in one API call
