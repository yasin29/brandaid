# Backlog

Prioritized list of remaining work. Update this as things are built or reprioritized.

Items are grouped by priority tier. Within each tier, order matters.

---

## Tier 1 — Must Have (Core Demo Path)

These are required for the demo to work and impress judges.

- [x] **End-to-end smoke test** — full pipeline confirmed working with real API key
- [x] **Polish InputPage V1** — shadcn components, platform Select, image preview, char counter, violet glow
- [x] **Cinematic ProcessingPage** — pulsing violet orb, animated stage list, live progress bar
- [x] **Polish ResultsDashboard V1** — score, persona cards with badges, forecast tiles, risks, before/after
- [x] **Backend: DimensionScores** — numeric 0–10 sub-scores added to `CampaignAnalysis`; campaign analyzer prompt updated
- [x] **ResultsPage V2** — Chart.js radar, count-up score, curtain reveal, "What's Working / Watch out" split, ranked rec cards, SVG sparklines, dramatic before/after
- [x] **InputPage V2** — visual platform tiles (7 platforms, color-coded), budget slider + presets, animated dropzone
- [x] **RAG integration** — `backend/data/knowledge_base/` seeded; `rag_service.py` implemented; context injected into forecast + recommendation prompts
- [x] **RAG enrichment** — all 5 knowledge base docs updated with sourced 2024-2025 benchmark data; ChromaDB reset for clean re-index
- [x] **ML forecast layer** — Random Forest on Kaggle ad data (R²=0.49); `ml_forecast_service.py`; ML CTR + ROAS ranges injected into forecast prompt as hard constraints
- [x] **Dynamic persona generation** — `audience_researcher.py` uses OpenAI Responses API web_search_preview; personas grounded in real 2024-2025 audience data; static templates replaced
- [x] **QA reviewer agent (Stage 7)** — independent LLM second-pass with 7 quality criteria; `QAReviewPanel` on ResultsPage
- [x] **Calculator tool in QA** — OpenAI function calling (`verify_campaign_math`); two-pass flow; catches ROAS vs ROI direction contradictions
- [x] **Prompt caching + token optimization** — stable system prompts, `asyncio.gather()` parallelization, trimmed token budgets
- [ ] **Deployment** — host backend + serve frontend for demo day; update `VITE_API_URL`

---

## Tier 2 — Should Have (Strengthens Demo)

- [ ] **`/docs` module** — live documentation page (submission requirement): pipeline walkthrough, architecture, tech stack, MCP integration, ML stats (Tier 1 — required for submission)
- [ ] **ROAS-flip demo moment** — animated before/after number transitions (ML + QA layers in place; needs frontend polish)
- [ ] **Error handling UI** — proper error states on InputPage if simulation fails (not just a silent hang)
- [ ] **Loading skeleton** on ResultsPage while waiting

---

## Tier 3 — Nice to Have (Polish)

- [ ] **Responsive design** — make all three screens usable on tablet/mobile
- [ ] **Share/export results** — copy results to clipboard or download as PDF
- [ ] **Retry on OpenAI errors** — exponential backoff for rate limit / timeout errors
- [ ] **Image cleanup job** — delete uploaded images older than N hours from `backend/uploads/`
- [ ] **VITE_API_URL env var** — replace hardcoded `localhost:8000` in `lib/api.ts` (also needed for deployment)

---

## Tier 4 — Post-Competition Only

Do not build these during the competition sprint.

- [ ] User authentication (Clerk / Supabase)
- [ ] Campaign history / saved simulations
- [ ] Multi-user support
- [ ] Real analytics integrations
- [ ] Custom persona builder
- [ ] A/B testing multiple campaign variants
- [ ] Production deployment with managed vector DB
- [ ] API rate limiting and cost controls

---

## Known Issues / Bugs

| # | Description | Severity | Status |
|---|-------------|----------|--------|
| 1 | `frontend/src/lib/` was initially caught by `lib/` gitignore rule — fixed with `!frontend/src/lib/` exception | Low | Fixed |
| 2 | Node 18 (system default) incompatible with Vite 9 — must use Node 22 via nvm | Medium | Documented in workflows.md |
| 3 | `baseUrl` in tsconfig deprecated in TS6 — removed, using `paths` alone with `moduleResolution: bundler` | Low | Fixed |
| 4 | Image uploads accumulate in `backend/uploads/` with no cleanup | Low | Open |
| 5 | `max_tokens` not supported by newer OpenAI models — replaced with `max_completion_tokens` in all service files | Medium | Fixed |
| 6 | ChromaDB re-indexes from scratch on every server start if `chroma_db/` is empty — acceptable for demo; takes ~5s | Low | By design |

---

## Design Reference Items (from team PRD analysis — 2026-05-24)

Items we may adapt if time permits. Full context in `docs/design_reference.md`.

- [x] Multi-step campaign brief wizard (7-step: Goal → Purpose → Channels → Creative → Audience → Budget → Review) — implemented as InputPage V3
- [ ] Market context signals panel (seasonal events, competitor spend signals)
- [ ] Per-channel breakdown table (ROAS/CTR/orders per platform — needs ML layer)
- [x] Sticky bottom action bar on ResultsPage ("Export PDF / Get Launch Plan") — implemented in V2
- [ ] Confetti burst on before/after reveal
