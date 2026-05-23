# Technical Decisions

A record of key decisions made during development, with rationale. Read this before making architectural changes.

---

## AI & Models

### Decision: Model names read from `.env`, never hardcoded
**Why:** OpenAI releases models frequently and pricing varies significantly (e.g. gpt-5.5 vs gpt-5.4-mini). Hardcoding creates brittleness. The `.env.example` provides sensible defaults with comments explaining the tradeoff.

### Decision: Use `AsyncOpenAI` throughout
**Why:** FastAPI is async-native. Using the sync client would block the event loop. All service functions are `async def` and `await` the OpenAI calls.

### Decision: `response_format={"type": "json_object"}` on all AI calls
**Why:** Ensures structured, parseable output from the LLM. All prompts instruct the model to return specific JSON keys that map directly to Pydantic models.

### Decision: Re-simulation (Stage 6) runs inline in the orchestrator
**Why:** Simplest path for the demo. The full `SimulationResult` (including optimized copy and re-sim forecast) is returned in one API call. This avoids a second round-trip from the frontend and keeps the loading screen simple. Can be split into two endpoints later if needed.

---

## Backend

### Decision: FastAPI over Flask/Django
**Why:** Async-first, automatic OpenAPI docs, native Pydantic integration, fast to set up. Matches the async AI call pattern.

### Decision: Single `/api/simulate/` endpoint (multipart form)
**Why:** Keeps the API surface minimal for MVP. Image upload via multipart is standard and avoids base64 encoding overhead in the request body.

### Decision: Images stored in `backend/uploads/` and committed to git
**Why:** Solo developer, multi-device workflow. Git acts as the sync mechanism. Not suitable for production scale but fine for demo/competition scope.

### Decision: ChromaDB local (committed to git)
**Why:** Same reason as uploads — multi-device sync. ChromaDB's local storage is a folder, easy to commit. Avoids needing a cloud vector DB account for a 3-4 day sprint.

### Decision: Persona templates are static (MVP)
**Why:** Speed. Three archetypal personas (Gen Z, Corporate, Value-Conscious) cover the demo well. The AI still generates dynamic reactions per persona per campaign. Dynamic persona generation is in the backlog.

---

## Frontend

### Decision: React state machine in `App.tsx` (no router)
**Why:** Only 3 screens (input → processing → results), linear flow. React Router would be overkill and add complexity. Simple `useState<Screen>` is transparent and fast to build.

### Decision: TailwindCSS v4 + shadcn/ui
**Why:** Tailwind v4 is the current stable release with Vite plugin support. shadcn/ui gives high-quality, composable components without a heavy design system. Both are what judges expect from a modern AI product.

### Decision: Dark theme forced (`<div className="dark">` in App.tsx)
**Why:** The product vision is "futuristic and AI-native." Dark mode fits. Light mode is not a priority for the competition demo.

### Decision: Path alias `@/` → `src/`
**Why:** Avoids `../../../` import chains as the component tree grows. Configured in both `vite.config.ts` (runtime) and `tsconfig.app.json` (type checking). Note: `baseUrl` was removed to avoid TypeScript 6 deprecation errors — `paths` alone works with `moduleResolution: bundler`.

---

## Infrastructure

### Decision: API-first, no GPU, cloud AI only
**Why:** No GPU available. OpenAI API covers multimodal (image analysis) and text generation. This is the correct architecture for a competition judged on AI-first design.

### Decision: No authentication for MVP
**Why:** Time constraint (3-4 days). Auth adds no demo value for a single-judge evaluation. Can be added post-competition if the product moves forward.

---

## Design & Visualization (added 2026-05-24)

### Decision: Add numeric `DimensionScores` to `CampaignAnalysis` (backend schema change)
**Why:** The radar chart visualization requires numeric values (0–10) per dimension. The LLM already generates qualitative descriptions; asking it to also return a numeric score in the same JSON call is cheap and gives us a proper data-backed visualization. Approximating from text in the frontend would be fragile and misleading.
**How to apply:** `CampaignAnalysis` now has both string fields (existing) and a nested `DimensionScores` object with 6 integer fields (0–10). The analyzer prompt instructs the model to return `dimension_scores` as a nested object.

### Decision: Chart.js for radar chart, SVG for sparklines
**Why:** Chart.js radar is complex to implement manually in SVG. However, sparklines are simple enough to render as inline SVG paths without the library overhead. This minimizes bundle size while still getting the polished radar visualization.
**How to apply:** `npm install chart.js`. Use `import { Chart, ... } from 'chart.js/auto'` for the radar. Sparklines use a simple `pathFromValues()` helper that generates an SVG path string.

### Decision: Adopt team PRD design patterns selectively, not wholesale
**Why:** Reviewed team PRD screens (`new-campaign.html`, `simulation-results.html`). Their product has a fundamentally different entry point (domain crawl → BusinessProfile → 8-step wizard). Adopting their entire flow would require an architectural rewrite. Instead we cherry-pick the highest-value UI patterns that fit our data model: radar chart, channel tiles, budget slider, "What's Working / Watch out" split, ranked rec cards, dramatic before/after.
**How to apply:** See `docs/design_reference.md` for the full adoption list. We keep our dark violet theme; they use light indigo. The interaction patterns are adopted, not the palette.

### Decision: Pursue ML forecast layer (Tier 2 priority)
**Why:** The team PRD describes a "deterministic forecasting layer" using benchmark lookup tables. A lightweight sklearn model trained on real Kaggle ad performance data is better — it gives actual numeric predictions (CTR%, ROAS, conversion rate) instead of LLM estimates, is more defensible to judges, and enables the ROAS-flip demo moment with real numbers. The hybrid approach (ML for numbers + LLM for reasoning text) is more credible than pure LLM.
**Architecture:** `backend/app/services/ml_forecast_service.py` loads a joblib-serialized sklearn model. `ForecastMetrics` gains `predicted_ctr_pct: float`, `predicted_roas: float`, `predicted_conversions: int` fields. Target datasets: "Social Media Advertising Dataset" on Kaggle. Model: Random Forest Regressor (fast to train, interpretable, handles tabular data well).
**Risk:** Feature engineering — our inputs (platform, objective, budget, copy quality score) need to map to what the dataset has. May need to engineer proxy features. Time estimate: 4–6 hours including data exploration.

### Decision: Node 22 required (not Node 18)
**Why:** Vite 9+ requires Node >= 20.19.0 or >= 22.12.0. Node 18 (the system default on the dev machine) fails. Use `nvm use 22.14.0` or ensure Node 22 is the default.
