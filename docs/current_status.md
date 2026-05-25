# Current Status

**Last updated:** 2026-05-25 (evening-3)
**Branch:** main
**Last commit:** `cfa7400` — Enrich RAG knowledge base with 2024-2025 benchmark data; reset ChromaDB

> Session 2026-05-25 (evening): MCP integration added — Brand-AId MCP server + Brave Search MCP client
> Session 2026-05-25 (late): 7-step wizard InputPage + structured campaign fields wired end-to-end (frontend + backend + AI prompts)
> Session 2026-05-25 (late-2): UI fixes — brand personality inputs grid layout (overflow fix), budget step switched to USD with $0 min and type-in text input

---

## What Is Done

### Infrastructure
- [x] Git repo initialized and connected to GitHub (`alviriseup/brand-AId`)
- [x] `.gitignore` updated (Node, venv, .env, dist)
- [x] `.env.example` committed with all required keys and comments
- [x] `CLAUDE.md` created with project rules and architecture summary
- [x] `docs/` folder created with persistent context files

### Backend
- [x] FastAPI app scaffolded (`backend/main.py`)
- [x] CORS configured for `http://localhost:5173`
- [x] Python 3.12 venv created at `backend/.venv/`
- [x] All dependencies installed (FastAPI, OpenAI 2.38.0, ChromaDB, pydantic-settings, aiofiles, sklearn, joblib, pandas, etc.)
- [x] Pydantic schemas for all data shapes (`app/models/schemas.py`)
- [x] Config via `pydantic-settings` reading from `.env` (`app/core/config.py`)
- [x] `AsyncOpenAI` client initialized (`app/services/openai_client.py`)
- [x] All 7 AI pipeline stages implemented (Stages 1–6 + QA Stage 7)
- [x] Simulation orchestrator wiring all stages with `asyncio.gather()` parallelization
- [x] `/api/simulate/` POST endpoint (multipart form with optional image upload)
- [x] `/health` GET endpoint
- [x] `max_tokens` → `max_completion_tokens` fix (was causing 400 errors)
- [x] `DimensionScores` numeric sub-scores in `CampaignAnalysis` (radar chart data)

### Frontend
- [x] Vite + React 18 + TypeScript scaffolded (Node 22)
- [x] TailwindCSS v4 + shadcn/ui installed and configured
- [x] shadcn components: button, card, input, label, progress, textarea, badge, select, separator
- [x] Path alias `@/` → `src/` configured
- [x] TypeScript types defined (`src/types/index.ts`) — includes QAReview, QAFlag, roas_range
- [x] API client (`src/lib/api.ts`)
- [x] Screen state machine in `App.tsx` (input → processing → results)
- [x] **InputPage V2**: Visual platform tiles (7 platforms, color-coded), budget slider + presets, animated drag-and-drop zone
- [x] **InputPage V3 (7-step wizard)**: Goal → Purpose (9 contextual sub-forms) → Channels → Creative → Audience → Budget → Review; `PurposeContext` typed; all 9 sub-purpose forms implemented
- [x] **Structured campaign fields**: `goal`, `sub_purpose`, `purpose_context`, `channels` added to `CampaignInput` end-to-end (frontend types, API client, backend schemas, route); `objective` + `platform` auto-derived for backward compat
- [x] **AI prompt enrichment**: funnel stage, sub_purpose, channels, purpose_context injected into all 4 AI service prompts; goal-specific metric framing (Awareness→reach, Consideration→CTR/CPL, Conversion→ROAS/CPA)
- [x] **`/docs` module**: live documentation page at `/app/docs` — pipeline walkthrough (7 stages), architecture, ML stats, RAG knowledge base, MCP integration, QA reviewer details, request flow, live backend health status
- [x] **ProcessingPage**: indigo orb, pipeline step list, live progress bar
- [x] **ResultsPage V2**: dark hero with 4 metric cards + confidence breakdown; light 2-col body; Chart.js radar; ranked rec cards; SVG sparklines; dramatic before/after; QAReviewPanel; sticky bottom action bar
- [x] Full UI redesign: light/dark hybrid, indigo (#4338CA) + emerald (#059669) design system

### Integration
- [x] End-to-end smoke test passed — full pipeline confirmed working
- [x] CORS confirmed working across ports (frontend → backend)

### RAG Layer
- [x] 5 knowledge base documents seeded in `backend/data/knowledge_base/`:
  - `platform_ctr_benchmarks.txt` — CTR by platform (2024-2025 sourced)
  - `roas_conversion_benchmarks.txt` — ROAS by industry/platform, conversion rates, CPA
  - `audience_psychology.txt` — Gen Z/Millennial/GenX/Boomer profiles, emotional triggers, trust signals
  - `platform_best_practices.txt` — Creative and targeting best practices per platform
  - `campaign_creative_guidelines.txt` — Copy effectiveness, visual signals, emotional tone, trust integration
- [x] **RAG enrichment** — all 5 docs updated with sourced 2024-2025 data (WordStream, Triple Whale, First Page Sage, Britopian, TikTok for Business, Motion App, Sprout Social)
- [x] `rag_service.py` — ChromaDB PersistentClient, auto-indexes on startup, cosine similarity retrieval
- [x] FastAPI lifespan — `initialize_rag()` called on server startup
- [x] `forecast_engine.py` — RAG retrieves CTR/ROAS benchmarks, injected into prompt
- [x] `recommendation_engine.py` — RAG retrieves platform best practices, injected into prompt
- [x] ChromaDB reset — old index cleared; server will re-index fresh on next startup

### ML Forecast Layer
- [x] Kaggle dataset: `Global Ads Performance (Google, Meta, TikTok)` — 1,800 rows
- [x] `scripts/train_forecast_model.py` — Random Forest: platform (84% importance) + budget_tier + campaign_type; R²=0.49, MAE=0.97%
- [x] `data/models/` — `ctr_model.joblib`, `encoders.joblib`, `dist_stats.json` (per-platform ROAS percentile bands)
- [x] `ml_forecast_service.py` — lazy-loads model, maps platform/objective/budget → ML prediction; `campaign_score` selects percentile band
- [x] `forecast_engine.py` — ML CTR and ROAS ranges injected into LLM prompt as hard constraints

### Agentic AI (Tool Calling + Web Search)
- [x] **`audience_researcher.py`** — OpenAI Responses API with built-in `web_search_preview` tool; searches current platform demographics and audience behavior; feeds persona generation
- [x] **`persona_generator.py`** — dynamic campaign-specific personas grounded in web-researched audience data (replaces static Alex/Morgan/Casey templates); graceful fallback if search fails
- [x] **QA reviewer calculator tool** — OpenAI function calling (`verify_campaign_math`) in `qa_reviewer.py`; two-pass flow: Pass 1 allows tool call (ROAS × budget math check), Pass 2 forces JSON review output; catches ROI direction vs ROAS contradictions deterministically

### QA Reviewer Agent (Stage 7)
- [x] `QAReview` + `QAFlag` schemas — in `schemas.py` and frontend `types/index.ts`
- [x] `qa_reviewer.py` — independent LLM pass reviewing full simulation against 7 criteria: forecast-persona consistency, risk specificity, recommendation-weakness alignment, persona differentiation, optimized copy quality, narrative coherence, numeric consistency (via calculator tool)
- [x] `simulation_orchestrator.py` — wired as Stage 7 after re-simulation completes
- [x] `ResultsPage.tsx` — `QAReviewPanel`: verdict badge (Pass/Partial Pass/Needs Improvement), confidence score bar, reviewer notes, expandable flags list with severity tags

### MCP Integration
- [x] **Brand-AId MCP Server** (`mcp_server/server.py`) — FastMCP server exposing 3 tools + 5 resources:
  - Tools: `simulate_campaign`, `analyze_ad_copy`, `query_benchmarks`
  - Resources: `benchmarks://ctr`, `benchmarks://roas`, `audiences://psychology`, `audiences://platforms`, `audiences://creative`
  - Registered in `.claude/settings.json` so Claude Code uses it automatically
- [x] **Brave Search MCP Client** (`backend/app/services/brave_search_mcp.py`) — Python `mcp` stdio client to `@modelcontextprotocol/server-brave-search`; runs 3 parallel searches per simulation
- [x] **`audience_researcher.py` updated** — uses Brave Search MCP when `BRAVE_API_KEY` is set; falls back to OpenAI `web_search_preview`
- [x] **New FastAPI routes** — `/api/analyze/` (Stage 1 only) and `/api/benchmarks/` (RAG query) used as MCP tool backends

### Prompt Caching / Token Optimization
- [x] Stable `_SYSTEM_PROMPT` constants extracted in all service files (campaign_analyzer, persona_generator, forecast_engine, recommendation_engine) — enables OpenAI prompt caching
- [x] `asyncio.gather()` parallelization: Stage 1 + audience research run simultaneously; Stage 4 + 5 run simultaneously; re-sim Stage 6a + 6b run simultaneously
- [x] RAG `n_results` trimmed (3→2 in forecast, 4→2 in recommendations)
- [x] `max_completion_tokens` budgets trimmed across all service calls

---

## What Is NOT Done Yet

### Frontend
- [ ] No mobile responsiveness
- [ ] Error handling UI — proper error states on InputPage if simulation fails
- [ ] Loading skeleton on ResultsPage

### Deployment
- [ ] No deployment configured yet (highest priority remaining item)
- [ ] `VITE_API_URL` env var — replace hardcoded `localhost:8000` in `lib/api.ts`

### Polish
- [ ] Uploaded images not cleaned up from `backend/uploads/`
- [ ] No retry/backoff logic on OpenAI calls
- [ ] ROAS-flip demo moment — animated before/after numbers not yet dramatically styled

---

## Immediate Next Steps (Priority Order)

1. **Deployment** — configure for demo day (frontend static + backend hosted); update `VITE_API_URL`
2. **Restart backend** — `uvicorn main:app --reload` to trigger ChromaDB re-index with enriched docs
3. **ROAS-flip demo moment** — polish the before/after section with animated number transitions
4. **Error handling UI** — prevent silent failures on InputPage
5. **Mobile responsiveness** — at least make it usable on a tablet for the demo
