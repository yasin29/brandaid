# Backlog

Prioritized list of remaining work. Update this as things are built or reprioritized.

Items are grouped by priority tier. Within each tier, order matters.

---

## Tier 1 — Must Have (Core Demo Path)

These are required for the demo to work and impress judges.

- [ ] **End-to-end smoke test** — run the full pipeline with a real API key and verify the JSON response is correct
- [ ] **Polish InputPage UI** — replace raw HTML inputs with shadcn components (Input, Textarea, Select, Label, Card, Button); apply dark futuristic design
- [ ] **Cinematic ProcessingPage** — replace spinner with animated stage-by-stage progress (animated text, pulsing glow, progress bar or step indicators)
- [ ] **Polish ResultsDashboard** — styled sections for: campaign score, persona reaction cards, forecast metric tiles, risk list, recommendation panel
- [ ] **Before/After re-simulation comparison** — side-by-side or toggle view showing original vs optimized campaign metrics
- [ ] **Image upload preview** — show thumbnail after selecting an image on the input form

---

## Tier 2 — Should Have (Strengthens Demo)

These make the demo more compelling and the product more believable.

- [ ] **RAG integration** — populate `backend/data/knowledge_base/` with marketing benchmark documents; implement `rag_service.py` to embed and retrieve context; inject retrieved context into forecast and recommendation prompts
- [ ] **Dynamic persona generation** — instead of static PERSONA_TEMPLATES, generate persona profiles dynamically based on campaign target audience
- [ ] **Animated score reveal** — campaign analysis overall score animates from 0 to the value (visual "wow" moment)
- [ ] **Forecast confidence visualization** — visual indicator (gauge, color coding) for confidence level and ROI direction
- [ ] **Persona reaction cards** — visually distinct cards per persona with emoji sentiment, engagement bar, objection tags
- [ ] **Error handling UI** — proper error states on InputPage if simulation fails (not just a toast)
- [ ] **Loading skeleton** on ResultsPage while waiting (if we split into two requests later)

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
