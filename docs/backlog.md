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
- [ ] **RAG integration** — seed `backend/data/knowledge_base/` with marketing benchmark docs; implement `rag_service.py`; inject context into forecast + recommendation prompts

---

## Tier 2 — Should Have (Strengthens Demo)

These make the demo more compelling and the product more believable.

- [ ] **ML forecast layer** — train lightweight sklearn Random Forest on Kaggle social media advertising dataset; add numeric `predicted_ctr`, `predicted_roas`, `predicted_conversions` fields to `ForecastMetrics`; enables ROAS-flip demo moment with real numbers. Target datasets: "Social Media Advertising Dataset", "Facebook Ad Campaign Performance". Architecture: `backend/app/services/ml_forecast_service.py` + `backend/data/models/` for joblib files.
- [ ] **ROAS-flip demo moment** — dramatic before/after with animated numbers (requires ML layer for real numeric values)
- [ ] **Dynamic persona generation** — generate persona profiles dynamically from campaign target audience instead of static templates
- [ ] **Error handling UI** — proper error states on InputPage if simulation fails (not just a toast)
- [ ] **Loading skeleton** on ResultsPage while waiting

---

## Tier 3 — Nice to Have (Polish)

- [ ] **Responsive design** — make all three screens usable on tablet/mobile
- [ ] **Campaign copy character counter** — show remaining characters in textarea
- [ ] **Platform-specific benchmarks** — adjust forecast language based on platform (Instagram CTR vs LinkedIn CTR ranges differ)
- [ ] **Share/export results** — copy results to clipboard or download as PDF
- [ ] **Retry on OpenAI errors** — exponential backoff for rate limit / timeout errors
- [ ] **Image cleanup job** — delete uploaded images older than N hours from `backend/uploads/`
- [ ] **VITE_API_URL env var** — replace hardcoded `localhost:8000` in `lib/api.ts` with `import.meta.env.VITE_API_URL` for deployment flexibility

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
| 5 | `max_tokens` not supported by newer OpenAI models — replaced with `max_completion_tokens` in all 4 service files | Medium | Fixed |

---

## Design Reference Items (from team PRD analysis — 2026-05-24)

Items we may adapt if time permits. Full context in `docs/design_reference.md`.

- [ ] Multi-step campaign brief wizard (8-stage conversational flow with live brief side panel)
- [ ] Market context signals panel (seasonal events, competitor spend signals)
- [ ] Per-channel breakdown table (ROAS/CTR/orders per platform — needs ML layer)
- [ ] Sticky bottom action bar on ResultsPage ("Export PDF / Get Launch Plan")
- [ ] Confetti burst on before/after reveal
