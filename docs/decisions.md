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

---

## AI Pipeline Architecture (added 2026-05-25)

### Decision: Parallelize stages with `asyncio.gather()` rather than sequential awaits
**Why:** Several pipeline stages are data-independent and can run concurrently. Audience research (web search) + Stage 1 (campaign analysis) run in parallel, hiding the web search latency entirely. Stage 4 (forecast) + Stage 5 (recommendations) also run in parallel. Re-sim Stage 6a (analysis) + 6b (persona) run in parallel. Total wall time reduced by ~40% vs sequential execution.
**How to apply:** Any two `async` service calls that don't depend on each other's output can be wrapped in `asyncio.gather()`. Check the orchestrator for the current dependency graph before adding new stages.

### Decision: Dynamic persona generation via OpenAI Responses API web_search_preview (replaces static templates)
**Why:** Static Alex/Morgan/Casey personas produced generic, unconvincing simulations. Real audience data (platform demographics, behavioral signals) makes the 3 personas credible and campaign-specific. The OpenAI Responses API has a built-in `web_search_preview` tool that lets the model autonomously decide what to search — no manual query construction needed.
**Architecture:** `audience_researcher.py` uses `client.responses.create(tools=[{"type": "web_search_preview"}])`. Returns a 300-500 word research brief fed to `persona_generator.py` as additional context. Graceful fallback to static archetype hints if the search fails (network error, API unavailability).
**How to apply:** The Responses API (`client.responses.create`) is distinct from Chat Completions (`client.chat.completions.create`) — different parameter names (`input` not `messages`, no `response_format`). Do not mix them.

### Decision: QA reviewer as a two-pass tool calling flow, not a single prompt
**Why:** OpenAI's `response_format={"type": "json_object"}` cannot be combined with `tools` in the same API call (the model won't call tools if forced into JSON output mode). Two-pass solution: Pass 1 uses `tool_choice="auto"` with no response_format so the model can call `verify_campaign_math`; Pass 2 appends tool results to the conversation and forces JSON output for the final review.
**Architecture:** `qa_reviewer.py` builds a message list, makes Pass 1 call, appends any tool call results as `role: "tool"` messages with matching `tool_call_id`, then makes Pass 2 call with `response_format={"type": "json_object"}`.
**How to apply:** Always append the assistant message from Pass 1 to the conversation before Pass 2 — the API requires the assistant's tool_call message to precede the tool result message.

### Decision: `verify_campaign_math` is pure Python, not an external API call
**Why:** The calculator tool only does arithmetic (ROAS × budget → revenue range, implied ROI direction from avg ROAS). There is no reason to make a network call for deterministic math. The OpenAI tool calling schema declares the function, but `_run_calculator(args)` runs locally. This keeps the QA stage fast and free of additional API dependencies.

### Decision: ML forecast uses a hybrid approach — ML for numbers, LLM for narrative
**Why:** The LLM cannot reliably produce calibrated numeric CTR/ROAS values (it hallucinates plausible-sounding but wrong numbers). The sklearn model (trained on real Kaggle ad data) produces defensible quantitative predictions. But the LLM is better at contextual reasoning and natural language explanation. Injecting ML numbers as hard constraints the LLM "must use verbatim" combines both strengths.
**Architecture:** `ml_forecast_service.py` runs first, `forecast_engine.py` embeds the ML-computed CTR range and ROAS band into the system prompt as constraints. LLM elaborates on engagement estimate, conversion trend, confidence level, and risk language.
**Risk to watch:** If ML numbers are unrealistic for a given campaign (e.g., a miscategorized platform), the LLM will reproduce bad numbers. The QA reviewer's `verify_campaign_math` tool provides a downstream sanity check.

### Decision: ROAS model uses precomputed percentile bands, not a regression model
**Why:** Attempted to train a ROAS regression model but R²≈0 — ROAS variance in the Kaggle dataset is driven by factors not captured in the features (industry, LTV, offer quality). Rather than shipping a useless model, we precomputed per-platform Q10/Q25/Q50/Q75/Q90 bands from the dataset. Campaign score (0-100 from analyzer) selects the percentile band. This is honest and more reliable than a random model.

### Decision: MCP strategy — build one server + use one external server (2026-05-25)
**Why:** Competition scoring awards points for building AND using MCP. Building Brand-AId as an MCP server makes the simulation engine callable by any MCP client (Claude Code, Claude Desktop, custom agents) without going through the REST API. Using Brave Search MCP for audience research replaces the OpenAI-proprietary `web_search_preview` with an open standard, and demonstrates MCP as a client.
**Architecture:** Two MCP integration points:
1. `mcp_server/server.py` (FastMCP) — custom Brand-AId server with 3 tools (`simulate_campaign`, `analyze_ad_copy`, `query_benchmarks`) and 5 resources (knowledge base docs). Registered in `.claude/settings.json` so Claude Code uses it in this project.
2. `brave_search_mcp.py` — Python `mcp` stdio client connecting to `npx @modelcontextprotocol/server-brave-search`. `audience_researcher.py` uses this when `BRAVE_API_KEY` is set; falls back to OpenAI `web_search_preview` if not.
**How to apply:** The Brand-AId MCP server calls the FastAPI backend via httpx (tools are HTTP wrappers), so the FastAPI server must be running. Resources read knowledge base files directly from disk (no backend required). Brave Search MCP spawns a Node.js subprocess per research call — acceptable since audience research happens once per simulation and runs in parallel with Stage 1.

### Decision: RAG knowledge base committed to git; ChromaDB reset when docs are enriched
**Why:** Multi-device development requires the knowledge base content to be in git. ChromaDB's local SQLite store is also committed so the vector index survives git pulls. When knowledge base docs are updated, the old ChromaDB is deleted and the `chroma_db/` directory is reset to just a `.gitkeep` — the server re-indexes from scratch on next startup (takes ~5 seconds, acceptable for demo scope).
**How to apply:** After updating any `.txt` file in `data/knowledge_base/`, delete `data/chroma_db/` contents (keep `.gitkeep`), commit, and restart the server. The lifespan handler calls `initialize_rag()` which detects the empty collection and re-indexes all documents.
