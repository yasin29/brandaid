# Design Reference

**Source:** Team PRD + generated HTML screen analysis — 2026-05-24
**Screens reviewed:** `new-campaign.html`, `simulation-results.html`
**PRD reviewed:** `.claude-project/docs/PRD.md`
**Location of team artifacts:** `/home/alvi105/Projects/ai-buildfest/team-prd/brandaid/`

---

## Their Product vs Ours — Key Differences

| Dimension | Team PRD Vision | Brand-AId (ours) |
|---|---|---|
| Entry point | Domain URL → crawl → BusinessProfile | Campaign brief form (direct) |
| Input flow | 8-step conversational wizard | Single polished form |
| Forecast layer | Deterministic benchmark lookup (static JSON) | LLM-generated (adding ML layer) |
| Forecast output | Real numbers: ROAS, Orders, Reach, CPA | Qualitative + adding numeric scores |
| Demo moment | "ROAS flip" — apply recs → numbers animate | Before/after forecast comparison |
| Palette | Indigo (#4338CA) + Cyan (#06B6D4), light theme | Violet (#6d28d9), dark theme |
| Auth | Single hardcoded demo user | No auth at all |

---

## What We Are Adopting

### InputPage
- [x] **Visual channel tiles** — color-coded platform grid (Instagram/LinkedIn/TikTok/Facebook/Google Ads/Twitter/YouTube) replacing the Select dropdown. Each tile has a colored top stripe, icon, and selected state with checkmark.
- [x] **Budget slider + presets** — slider with preset buttons ($500 / $1K / $5K / $10K / $50K), replaces free-text budget input. Value formatted as "$X,XXX/month".
- [x] **Animated drag-and-drop zone** — bobbing upload icon animation, hover state glow.

### ResultsPage
- [x] **Chart.js radar chart** — plots our 6 `dimension_scores` (0–10) as a radar. Requires backend to return numeric sub-scores alongside text descriptions.
- [x] **Count-up animation** — overall campaign score animates from 0 to the actual value on mount.
- [x] **Curtain reveal** — dark overlay fades out when results page mounts.
- [x] **"What's Working / Watch out for" split** — campaign analysis items split by dimension score threshold (≥6 = working, <6 = watch out). Replaces flat text grid.
- [x] **Ranked recommendation cards** — numbered 01–04, each card shows label + content. Styled like the team's rec cards with impact indicator.
- [x] **Sparklines in forecast tiles** — SVG mini trend lines (directionally appropriate, illustrative for demo).
- [x] **Dramatic before/after cards** — side-by-side "Before / After recommendations" with metric comparison and "Improved ✓" badge.

---

## What We May Adapt Later (If Time Permits)

- **Multi-step campaign wizard** — their 8-stage wizard is more polished for ongoing product use. Could replace our single form post-competition.
- **Live brief side panel** — updates as user fills in each stage. Valuable UX but requires significant restructure.
- **Market context signals** — timing signals (seasonal, competitor activity) injected into the forecast. Requires a signals data source.
- **Per-channel breakdown table** — ROAS/CTR/orders by channel. Requires our ML layer to produce per-channel predictions.
- **Sticky bottom action bar** on ResultsPage — "Export PDF / Get Launch Plan" CTA bar.
- **Confetti burst on before/after reveal** — celebratory animation when ROAS improves.
- **"Get Launch Plan" flow** — post-simulation step with checklist, creative brief, tracking setup.

---

## What Doesn't Apply (Architecturally Incompatible)

- Domain crawl → BusinessProfile (different product entry point)
- Multi-user / organization support
- Real-time platform data pulls (Meta/Google live API)
- Staged funnel persistence (Awareness → Consideration → Conversion as separate saved stages)

---

## Chart.js Usage Notes

- Installed via `npm install chart.js`
- Import via `chart.js/auto` for simplicity (registers all chart types)
- Radar: 6 dimensions, 0–10 scale, violet fill + border
- Sparklines: implemented as SVG paths (no Chart.js needed for mini lines)
- Destroy chart instance on component unmount to prevent canvas reuse errors

---

## Palette Reference (for consistency)

| Token | Hex | Used for |
|---|---|---|
| Primary accent | `#7c3aed` (violet-600) | Buttons, active states, glow |
| Radar fill | `rgba(124,58,237,0.15)` | Radar chart background |
| Success | `#10b981` (emerald-500) | High scores, positive ROI, "after" card |
| Warning | `#f59e0b` (amber-500) | Medium scores, watch-out items |
| Danger | `#ef4444` (red-500) | Low scores, risks |
| Background | `#0a0a0f` | Page background (set on body) |
| Card | `rgba(255,255,255,0.03)` | Glass card surfaces |
| Border | `rgba(255,255,255,0.10)` | Card borders |
