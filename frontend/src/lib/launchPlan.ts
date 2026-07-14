import type { SimulationResult, DimensionScores } from '@/types'

type CampaignSummary = { objective: string; platform: string; ad_copy: string } | null

// ── Helpers ─────────────────────────────────────────────────────────────────

function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function scoreColor(n: number): string {
  if (n >= 70) return '#059669'
  if (n >= 50) return '#D97706'
  return '#DC2626'
}

function scoreVerdict(n: number): string {
  return n >= 75 ? 'Strong — likely to perform well'
    : n >= 55 ? 'Moderate — has improvement areas'
    : 'Needs work — gaps identified'
}

function roiColor(dir: string): string {
  return dir === 'Positive' ? '#059669' : dir === 'Negative' ? '#DC2626' : '#D97706'
}

function levelBadge(level: string): string {
  const map: Record<string, string> = {
    High: 'background:#D1FAE5;color:#065F46',
    Medium: 'background:#FEF3C7;color:#92400E',
    Low: 'background:#FEE2E2;color:#991B1B',
  }
  return map[level] ?? 'background:#F1F5F9;color:#475569'
}

const DIMENSIONS: Array<{ key: keyof DimensionScores; label: string }> = [
  { key: 'emotional_tone', label: 'Emotional Tone' },
  { key: 'cta_strength', label: 'CTA Strength' },
  { key: 'audience_fit', label: 'Audience Fit' },
  { key: 'trust_signals', label: 'Trust Signals' },
  { key: 'clarity', label: 'Clarity' },
  { key: 'emotional_appeal', label: 'Emotional Appeal' },
]

// ── Document builder ────────────────────────────────────────────────────────

export function buildLaunchPlanHTML(result: SimulationResult, summary: CampaignSummary): string {
  const analysis = result.campaign_analysis
  const forecast = result.forecast
  const score = analysis.overall_score
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  const simId = 'SIM-' + Date.now().toString(36).slice(-6).toUpperCase()
  const objective = summary?.objective || 'Campaign Simulation'
  const platform = summary?.platform || '—'

  const dimensionRows = DIMENSIONS.map(({ key, label }) => {
    const s = analysis.dimension_scores[key]
    const col = s >= 6 ? '#059669' : s >= 4 ? '#D97706' : '#DC2626'
    return `
      <tr>
        <td style="font-weight:600;white-space:nowrap">${esc(label)}</td>
        <td style="text-align:center"><span style="font-weight:700;color:${col}">${esc(s)}/10</span></td>
        <td style="color:#475569">${esc(analysis[key])}</td>
      </tr>`
  }).join('')

  const recs = result.recommendations
  const recRows = [
    { label: 'Improved CTA', v: recs.improved_cta },
    { label: 'Stronger Messaging', v: recs.stronger_messaging },
    { label: 'Audience Refinement', v: recs.audience_refinement },
    { label: 'Platform Strategy', v: recs.platform_strategy },
  ].map((r, i) => `
    <div class="rec">
      <span class="rec-n">${String(i + 1).padStart(2, '0')}</span>
      <div>
        <div class="rec-label">${esc(r.label)}</div>
        <div>${esc(r.v)}</div>
      </div>
    </div>`).join('')

  const tips = recs.optimization_tips.length
    ? `<ul class="tips">${recs.optimization_tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`
    : ''

  const risks = result.risks.length
    ? `<ul class="risks">${result.risks.map(r => `<li>${esc(r)}</li>`).join('')}</ul>`
    : '<p class="muted">No significant risks identified.</p>'

  const personas = result.personas.map(p => `
    <div class="persona">
      <div class="persona-head">
        <div>
          <div class="persona-name">${esc(p.persona_name)}</div>
          <div class="muted">${esc(p.persona_type)}</div>
        </div>
        <div class="badges">
          <span class="badge" style="${levelBadge(p.engagement_likelihood)}">Engage · ${esc(p.engagement_likelihood)}</span>
          <span class="badge" style="${levelBadge(p.trust_level)}">Trust · ${esc(p.trust_level)}</span>
          <span class="badge" style="${levelBadge(p.conversion_likelihood)}">Convert · ${esc(p.conversion_likelihood)}</span>
        </div>
      </div>
      <p>${esc(p.emotional_reaction)}</p>
      ${p.objections.length ? `<div class="obj">${p.objections.map(o => `<span>${esc(o)}</span>`).join('')}</div>` : ''}
    </div>`).join('')

  const qa = result.qa_review
  const qaBlock = qa ? `
    <div class="card">
      <h2>QA Review</h2>
      <div class="qa-row">
        <div><span class="muted">Verdict</span><div class="qa-verdict">${esc(qa.verdict)}</div></div>
        <div><span class="muted">Confidence</span><div class="qa-verdict">${esc(qa.confidence_score)}/100</div></div>
      </div>
      <p style="margin-top:10px">${esc(qa.reviewer_notes)}</p>
      ${qa.flags.length ? `<ul class="risks" style="margin-top:8px">${qa.flags.map(f => `<li><strong>[${esc(f.severity)}] ${esc(f.section)}:</strong> ${esc(f.issue)}</li>`).join('')}</ul>` : ''}
    </div>` : ''

  const beforeAfter = (result.optimized_copy && result.optimized_forecast) ? `
    <div class="card avoid-break">
      <h2>Before → After AI Recommendations</h2>
      <div class="ba">
        <div class="ba-col">
          <div class="ba-tag">Before — Original</div>
          <div class="ba-metrics">
            <div><span class="muted">CTR</span><div>${esc(forecast.ctr_range)}</div></div>
            <div><span class="muted">ROI</span><div>${esc(forecast.roi_direction)}</div></div>
            <div><span class="muted">Confidence</span><div>${esc(forecast.confidence_level)}</div></div>
          </div>
          <div class="ba-copy muted">${esc(summary?.ad_copy || '')}</div>
        </div>
        <div class="ba-col ba-after">
          <div class="ba-tag" style="background:#059669;color:#fff">After — Optimized</div>
          <div class="ba-metrics">
            <div><span class="muted">CTR</span><div><strong>${esc(result.optimized_forecast.ctr_range)}</strong></div></div>
            <div><span class="muted">ROI</span><div><strong>${esc(result.optimized_forecast.roi_direction)}</strong></div></div>
            <div><span class="muted">Confidence</span><div><strong>${esc(result.optimized_forecast.confidence_level)}</strong></div></div>
          </div>
          <div class="ba-copy">${esc(result.optimized_copy)}</div>
        </div>
      </div>
    </div>` : ''

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Launch Plan — ${esc(objective)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0F172A; background: #F1F5F9; line-height: 1.5; }
  .toolbar { position: sticky; top: 0; background: #0F172A; color: #fff; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; gap: 12px; z-index: 10; }
  .toolbar span { font-size: 13px; color: #94A3B8; }
  .toolbar button { background: #6366F1; color: #fff; border: 0; padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
  .toolbar button:hover { background: #4F46E5; }
  .page { max-width: 860px; margin: 24px auto; background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
  header.hero { border-bottom: 2px solid #E2E8F0; padding-bottom: 20px; margin-bottom: 24px; }
  .brand { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 15px; }
  .brand .logo { width: 24px; height: 24px; border-radius: 6px; background: #4338CA; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 800; }
  h1 { font-size: 28px; margin: 14px 0 6px; letter-spacing: -0.02em; }
  .meta { color: #64748B; font-size: 13px; }
  .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
  .kpi { border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; }
  .kpi .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #94A3B8; font-weight: 700; margin-bottom: 6px; }
  .kpi .value { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
  .kpi .sub { font-size: 11px; color: #94A3B8; margin-top: 2px; }
  .card { border: 1px solid #E2E8F0; border-radius: 10px; padding: 20px; margin-bottom: 18px; }
  h2 { font-size: 16px; margin: 0 0 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td { padding: 8px 6px; border-bottom: 1px solid #F1F5F9; vertical-align: top; }
  .muted { color: #94A3B8; font-size: 12px; }
  .rec { display: grid; grid-template-columns: auto 1fr; gap: 12px; padding: 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 8px; font-size: 13px; }
  .rec-n { font-weight: 800; color: #CBD5E1; }
  .rec-label { font-size: 11px; color: #94A3B8; margin-bottom: 2px; }
  .tips { margin: 12px 0 0; padding-left: 18px; font-size: 13px; color: #334155; }
  .tips li { margin-bottom: 4px; }
  .risks { margin: 0; padding-left: 18px; font-size: 13px; color: #334155; }
  .risks li { margin-bottom: 6px; }
  .persona { border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; margin-bottom: 10px; font-size: 13px; }
  .persona-head { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
  .persona-name { font-weight: 700; }
  .badges { display: flex; gap: 6px; flex-wrap: wrap; }
  .badge { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; white-space: nowrap; }
  .obj { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .obj span { font-size: 11px; background: #F1F5F9; color: #64748B; border: 1px solid #E2E8F0; padding: 2px 8px; border-radius: 20px; }
  .qa-row { display: flex; gap: 32px; }
  .qa-verdict { font-size: 18px; font-weight: 800; }
  .ba { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .ba-col { border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px; }
  .ba-after { border-color: #A7F3D0; background: #F0FDF4; }
  .ba-tag { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; background: #F1F5F9; color: #64748B; padding: 3px 10px; border-radius: 6px; margin-bottom: 10px; }
  .ba-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; font-size: 13px; }
  .ba-copy { font-size: 12px; line-height: 1.5; padding-top: 10px; border-top: 1px solid #E2E8F0; }
  footer { text-align: center; color: #94A3B8; font-size: 12px; margin: 24px 0 40px; }
  .avoid-break { break-inside: avoid; }
  @page { size: A4; margin: 14mm; }
  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .page { box-shadow: none; margin: 0; max-width: none; padding: 0; border-radius: 0; }
    .card, .persona, .rec, .avoid-break { break-inside: avoid; }
  }
</style>
</head>
<body>
  <div class="toolbar no-print">
    <span>Brand-AId Launch Plan · ${esc(date)}</span>
    <button onclick="window.print()">Save as PDF / Print</button>
  </div>

  <div class="page">
    <header class="hero">
      <div class="brand"><span class="logo">+</span> Brand-AId</div>
      <h1>${esc(objective)}</h1>
      <div class="meta">${esc(simId)} · Platform: ${esc(platform)} · Generated ${esc(date)}</div>
    </header>

    <div class="kpis">
      <div class="kpi">
        <div class="label">Campaign Score</div>
        <div class="value" style="color:${scoreColor(score)}">${esc(score)}<span style="font-size:14px;color:#CBD5E1">/100</span></div>
        <div class="sub">${esc(scoreVerdict(score))}</div>
      </div>
      <div class="kpi">
        <div class="label">CTR Range</div>
        <div class="value" style="font-size:20px">${esc(forecast.ctr_range)}</div>
        <div class="sub">click-through rate</div>
      </div>
      <div class="kpi">
        <div class="label">ROI Direction</div>
        <div class="value" style="font-size:22px;color:${roiColor(forecast.roi_direction)}">${esc(forecast.roi_direction)}</div>
        <div class="sub">${esc(forecast.confidence_level)} confidence</div>
      </div>
      <div class="kpi">
        <div class="label">Engagement</div>
        <div class="value" style="font-size:14px;font-weight:600;line-height:1.4">${esc(forecast.engagement_estimate)}</div>
      </div>
    </div>

    <div class="card avoid-break">
      <h2>Campaign Analysis</h2>
      <table><tbody>${dimensionRows}</tbody></table>
    </div>

    <div class="card">
      <h2>Forecast Detail</h2>
      <table><tbody>
        <tr><td style="font-weight:600;white-space:nowrap">CTR Range</td><td>${esc(forecast.ctr_range)}</td></tr>
        ${forecast.roas_range ? `<tr><td style="font-weight:600">ROAS Range</td><td>${esc(forecast.roas_range)}</td></tr>` : ''}
        <tr><td style="font-weight:600;white-space:nowrap">Conversion Trend</td><td>${esc(forecast.conversion_trend)}</td></tr>
        <tr><td style="font-weight:600;white-space:nowrap">Engagement</td><td>${esc(forecast.engagement_estimate)}</td></tr>
        <tr><td style="font-weight:600;white-space:nowrap">ROI Direction</td><td style="color:${roiColor(forecast.roi_direction)};font-weight:700">${esc(forecast.roi_direction)}</td></tr>
        <tr><td style="font-weight:600;white-space:nowrap">Confidence</td><td>${esc(forecast.confidence_level)}</td></tr>
      </tbody></table>
    </div>

    <div class="card">
      <h2>AI Recommendations</h2>
      ${recRows}
      ${tips}
    </div>

    <div class="card avoid-break">
      <h2>Identified Risks</h2>
      ${risks}
    </div>

    <div class="card">
      <h2>Audience Personas</h2>
      ${personas}
    </div>

    ${beforeAfter}
    ${qaBlock}

    <footer>Brand-AId · AI Campaign Simulation · Build by Yasin Billah</footer>
  </div>
</body>
</html>`
}

export function openLaunchPlan(result: SimulationResult, summary: CampaignSummary): void {
  const html = buildLaunchPlanHTML(result, summary)
  const win = window.open('', '_blank')
  if (win) {
    win.document.open()
    win.document.write(html)
    win.document.close()
  } else {
    // Popup blocked — fall back to downloading the self-contained page.
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'brand-aid-launch-plan.html'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
