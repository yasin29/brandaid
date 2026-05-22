# Brand-AId — Claude Code Guidelines

## Persistent Context — Read This First

The `docs/` folder is the source of truth for project state across sessions and devices. Always read the relevant docs before starting work:

| File | What it contains |
|------|-----------------|
| [docs/architecture.md](docs/architecture.md) | Full system diagram, tech stack, API contract, directory map |
| [docs/current_status.md](docs/current_status.md) | What is done, what is not done, immediate next steps |
| [docs/decisions.md](docs/decisions.md) | Why things were built the way they were — read before changing architecture |
| [docs/workflows.md](docs/workflows.md) | How to run locally, node version, env vars, git workflow |
| [docs/backlog.md](docs/backlog.md) | Prioritized remaining work + known bugs |
| [docs/deployment.md](docs/deployment.md) | How to deploy for the demo |

**After completing a meaningful chunk of work, update `docs/current_status.md` and `docs/backlog.md`.**

---

## What This Project Is

Brand-AId is an AI-powered campaign simulation engine built for **Infinity AI Buildfest 2026** (Branding & Marketing / MarTech track).

Marketers input a campaign (copy + image + targeting info). The AI simulates how synthetic audience personas would react — forecasting performance *before* real money is spent.

## Project Structure

```
brand-AId/
├── backend/          # FastAPI server + AI pipeline
│   ├── app/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # AI pipeline stages (one file per stage)
│   │   ├── models/       # Pydantic schemas
│   │   └── core/         # Config, settings
│   ├── data/
│   │   ├── knowledge_base/   # RAG source documents (.txt / .md)
│   │   └── chroma_db/        # ChromaDB vector store (committed for multi-device sync)
│   ├── uploads/          # Uploaded campaign images (committed for multi-device sync)
│   ├── main.py           # FastAPI app entry point
│   └── requirements.txt
└── frontend/         # React + Vite + TailwindCSS + shadcn/ui
    ├── src/
    │   ├── pages/        # InputPage, ProcessingPage, ResultsPage
    │   ├── components/   # Reusable UI components
    │   ├── lib/          # api.ts (Axios client), utils
    │   └── types/        # Shared TypeScript types
    └── ...
```

## Tech Stack

| Layer      | Tech                                                   |
|------------|--------------------------------------------------------|
| Frontend   | React 18, Vite, TypeScript, TailwindCSS, shadcn/ui     |
| Backend    | FastAPI, Python 3.12+                                  |
| AI         | OpenAI (multimodal LLM + embeddings — configured via .env) |
| Vector DB  | ChromaDB (local)                                       |

> Model names and versions are **not hardcoded** — always read from `.env`. Check OpenAI's official docs for the latest available model IDs before coding any model references.

## AI Pipeline (6 Stages)

1. **Campaign Analysis** — multimodal LLM: tone, CTA, clarity, trust signals
2. **Persona Generation** — 3 synthetic personas with traits and motivations
3. **Audience Simulation** — each persona reacts: engagement, trust, conversion, objections
4. **Forecast Engine** — CTR range, engagement estimate, conversion trend, ROI direction
5. **Recommendation Engine** — improved CTA, messaging, audience, platform strategy
6. **Re-Simulation** — AI rewrites copy, reruns simulation, shows before/after comparison

## Development Rules

- **Build vertical slices** — get one complete end-to-end flow working before expanding
- **No overbuilding** — no auth, no user management, no enterprise dashboards
- **No custom ML training** — API-first only (OpenAI)
- **Demo quality > feature count** — polish matters more than completeness
- **RAG stays lightweight** — ChromaDB + embeddings for competition requirement only
- **Always check official docs** — for model names, API parameters, and library versions before coding

## Running Locally

### Backend
```bash
cd backend
source .venv/bin/activate        # Windows: .venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm run dev                       # runs on http://localhost:5173
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your API keys and model names. Never commit `.env`.

## Priorities (in order)

1. Working AI pipeline (Input → AI → Output)
2. Frontend/backend integration
3. Structured AI responses (Pydantic schemas)
4. Good UI/UX (futuristic, AI-native feel)
5. Persona simulation display
6. Forecast metrics display
7. Re-simulation flow
8. RAG integration
9. Additional polish
