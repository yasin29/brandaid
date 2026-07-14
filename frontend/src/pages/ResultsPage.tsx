import { useEffect, useRef, useState } from 'react'
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import type { SimulationResult, DimensionScores, QAReview } from '@/types'
import { openLaunchPlan } from '@/lib/launchPlan'

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

interface Props {
  result: SimulationResult
  campaignSummary: { objective: string; platform: string; ad_copy: string } | null
  onReset: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * target))
      if (t < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return value
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 70, h = 28
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - v * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={`M ${pts.join(' L ')}`} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  )
}

function sparkValues(roi: string) {
  if (roi === 'Positive') return [0.25, 0.38, 0.50, 0.62, 0.73, 0.85]
  if (roi === 'Negative') return [0.82, 0.70, 0.58, 0.46, 0.36, 0.26]
  return [0.45, 0.52, 0.47, 0.55, 0.50, 0.57]
}

function roiColor(dir: string) {
  return dir === 'Positive' ? '#34D399' : dir === 'Negative' ? '#F87171' : '#FBBF24'
}

function levelColor(level: 'Low' | 'Medium' | 'High') {
  return level === 'High' ? '#34D399' : level === 'Medium' ? '#FBBF24' : '#F87171'
}

function scoreStyle(score: number) {
  if (score >= 70) return { color: '#059669', bg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.25)', text: '#065F46' }
  if (score >= 50) return { color: '#D97706', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.25)', text: '#92400E' }
  return { color: '#DC2626', bg: 'rgba(220,38,38,0.1)', border: 'rgba(220,38,38,0.25)', text: '#7F1D1D' }
}

function scoreVerdict(score: number) {
  return score >= 75 ? 'Strong — likely to perform well'
    : score >= 55 ? 'Moderate — has improvement areas'
    : 'Needs work — gaps identified'
}

// ── Radar chart (emerald) ─────────────────────────────────────────────────────

const DIMENSION_LABELS = [
  'Emotional Tone', 'CTA Strength', 'Audience Fit',
  'Trust Signals', 'Clarity', 'Emotional Appeal',
]

function RadarChart({ scores }: { scores: DimensionScores }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    chartRef.current?.destroy()

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels: DIMENSION_LABELS,
        datasets: [{
          label: 'Campaign Quality',
          data: [
            scores.emotional_tone, scores.cta_strength, scores.audience_fit,
            scores.trust_signals, scores.clarity, scores.emotional_appeal,
          ],
          backgroundColor: 'rgba(5,150,105,0.12)',
          borderColor: '#059669',
          borderWidth: 2.5,
          pointBackgroundColor: '#059669',
          pointRadius: 4,
          pointHoverRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            min: 0, max: 10,
            ticks: { display: false, stepSize: 2 },
            grid: { color: '#E2E8F0' },
            angleLines: { color: '#E2E8F0' },
            pointLabels: { font: { size: 11, weight: 600 }, color: '#64748B' },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0F172A',
            padding: 10,
            callbacks: {
              title: ctx => ctx[0].label,
              label: ctx => `Score: ${ctx.parsed.r} / 10`,
            },
          },
        },
        animation: { duration: 1500, easing: 'easeInOutQuart' },
      },
    })
    return () => { chartRef.current?.destroy(); chartRef.current = null }
  }, [scores])

  return <canvas ref={canvasRef} />
}

// ── Analysis split ────────────────────────────────────────────────────────────

const DIMENSION_KEYS = [
  'emotional_tone', 'cta_strength', 'audience_fit',
  'trust_signals', 'clarity', 'emotional_appeal',
] as const

const DIMENSION_NAMES: Record<string, string> = {
  emotional_tone: 'Emotional Tone',
  cta_strength: 'CTA Strength',
  audience_fit: 'Audience Fit',
  trust_signals: 'Trust Signals',
  clarity: 'Clarity',
  emotional_appeal: 'Emotional Appeal',
}

function AnalysisSplit({ analysis }: { analysis: SimulationResult['campaign_analysis'] }) {
  const working = DIMENSION_KEYS.filter(k => analysis.dimension_scores[k] >= 6)
  const watchOut = DIMENSION_KEYS.filter(k => analysis.dimension_scores[k] < 6)

  return (
    <div className="space-y-5">
      {working.length > 0 && (
        <div>
          <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3">
            ✓ What's Working
          </span>
          <div className="space-y-3">
            {working.map(k => (
              <div key={k} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-700 text-[10px] font-bold">✓</span>
                </div>
                <div>
                  <p className="text-slate-800 text-sm font-semibold">{DIMENSION_NAMES[k]}: {analysis.dimension_scores[k]}/10</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{analysis[k]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {watchOut.length > 0 && (
        <div className={working.length > 0 ? 'pt-4 border-t border-dashed border-slate-200' : ''}>
          <span className="inline-block bg-amber-100 text-amber-800 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md mb-3">
            ⚠ Watch out for
          </span>
          <div className="space-y-3">
            {watchOut.map(k => (
              <div key={k} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-700 text-[10px] font-bold">⚠</span>
                </div>
                <div>
                  <p className="text-slate-800 text-sm font-semibold">{DIMENSION_NAMES[k]}: {analysis.dimension_scores[k]}/10</p>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{analysis[k]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Ranked recommendations ────────────────────────────────────────────────────

const REC_FIELDS = [
  { key: 'improved_cta',        label: 'Improved CTA' },
  { key: 'stronger_messaging',  label: 'Stronger Messaging' },
  { key: 'audience_refinement', label: 'Audience Refinement' },
  { key: 'platform_strategy',   label: 'Platform Strategy' },
] as const

function RankedRecs({ recs }: { recs: SimulationResult['recommendations'] }) {
  return (
    <div className="space-y-3">
      {REC_FIELDS.map(({ key, label }, i) => (
        <div key={key} className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-[auto_1fr_auto] gap-4 items-start">
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">0{i + 1}</p>
          <div>
            <p className="text-xs text-slate-400 mb-0.5">{label}</p>
            <p className="text-slate-800 text-sm leading-relaxed font-medium">{recs[key]}</p>
          </div>
          <svg className="text-emerald-600 mt-0.5 flex-shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5L12 19M5 12L12 5L19 12" />
          </svg>
        </div>
      ))}

      {recs.optimization_tips.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">Additional Tips</p>
          <ul className="space-y-2">
            {recs.optimization_tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-700">
                <span className="text-emerald-600 flex-shrink-0 font-bold">›</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Persona card ──────────────────────────────────────────────────────────────

function badgeCls(level: 'Low' | 'Medium' | 'High') {
  return level === 'High'
    ? 'bg-emerald-100 text-emerald-800'
    : level === 'Medium'
    ? 'bg-amber-100 text-amber-800'
    : 'bg-red-100 text-red-800'
}

function PersonaCard({ persona }: { persona: SimulationResult['personas'][0] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-slate-900 font-semibold text-sm">{persona.persona_name}</p>
          <p className="text-slate-500 text-xs">{persona.persona_type}</p>
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeCls(persona.engagement_likelihood)}`}>
            Engage · {persona.engagement_likelihood}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeCls(persona.trust_level)}`}>
            Trust · {persona.trust_level}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeCls(persona.conversion_likelihood)}`}>
            Convert · {persona.conversion_likelihood}
          </span>
        </div>
      </div>
      <p className="text-slate-600 text-sm mb-2 leading-relaxed">{persona.emotional_reaction}</p>
      {persona.objections.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {persona.objections.map((obj, i) => (
            <span key={i} className="text-[11px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">{obj}</span>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Before / After ────────────────────────────────────────────────────────────

const ROI_ORDER: Record<string, number> = { Negative: 0, Neutral: 1, Positive: 2 }
const CONF_ORDER: Record<string, number> = { Low: 0, Medium: 1, High: 2 }

function parseCtrMid(s: string): number {
  const m = s.match(/([\d.]+)/g)
  if (!m || m.length < 2) return parseFloat(m?.[0] ?? '0')
  return (parseFloat(m[0]) + parseFloat(m[1])) / 2
}

function compareForecasts(orig: SimulationResult['forecast'], opt: SimulationResult['forecast']): 'improved' | 'similar' | 'degraded' {
  const roiDiff = (ROI_ORDER[opt.roi_direction] ?? 1) - (ROI_ORDER[orig.roi_direction] ?? 1)
  if (roiDiff > 0) return 'improved'
  if (roiDiff < 0) return 'degraded'
  const confDiff = (CONF_ORDER[opt.confidence_level] ?? 1) - (CONF_ORDER[orig.confidence_level] ?? 1)
  if (confDiff > 0) return 'improved'
  if (confDiff < 0) return 'degraded'
  const ctrDiff = parseCtrMid(opt.ctr_range) - parseCtrMid(orig.ctr_range)
  if (ctrDiff > 0.2) return 'improved'
  if (ctrDiff < -0.2) return 'degraded'
  return 'similar'
}

function roiPillCls(dir: string) {
  if (dir === 'Positive') return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  if (dir === 'Negative') return 'bg-red-100 text-red-800 border-red-200'
  return 'bg-amber-100 text-amber-800 border-amber-200'
}

function BeforeAfter({ result, originalAdCopy }: { result: SimulationResult; originalAdCopy: string }) {
  if (!result.optimized_copy || !result.optimized_forecast) return null
  const orig = result.forecast
  const opt = result.optimized_forecast
  const comparison = compareForecasts(orig, opt)
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const badgeConfig = {
    improved: { label: 'Improved ✓', cls: 'bg-emerald-600 text-white', border: 'border-emerald-500', grad: 'from-emerald-50 to-white' },
    similar:  { label: 'Marginal ~', cls: 'bg-slate-500 text-white',   border: 'border-slate-400',   grad: 'from-slate-50 to-white' },
    degraded: { label: 'Caution ↓', cls: 'bg-amber-600 text-white',   border: 'border-amber-400',   grad: 'from-amber-50 to-white' },
  }[comparison]

  const roiChanged = orig.roi_direction !== opt.roi_direction
  const confChanged = orig.confidence_level !== opt.confidence_level
  const ctrMidDiff = parseCtrMid(opt.ctr_range) - parseCtrMid(orig.ctr_range)

  return (
    <section ref={sectionRef} className="bg-white border-t-2 border-slate-100 px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
          <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full uppercase tracking-wider">Before</span>
          <span className="text-slate-400 text-xl font-bold">→</span>
          <span className="text-[11px] font-bold bg-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full uppercase tracking-wider">After AI Recommendations</span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Before */}
          <div className="bg-white border-[1.5px] border-slate-200 rounded-2xl p-7">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Before</p>
            <p className="text-slate-500 font-semibold mb-5">Original Campaign</p>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'CTR', value: orig.ctr_range },
                { label: 'ROI', value: orig.roi_direction },
                { label: 'Confidence', value: orig.confidence_level },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">{label}</p>
                  <p className="text-slate-400 font-semibold line-through">{value}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Original Copy</p>
              <p className="text-slate-400 text-xs leading-relaxed line-through line-clamp-3">
                {originalAdCopy.substring(0, 160)}
              </p>
            </div>
          </div>

          {/* After */}
          <div className={`bg-gradient-to-br ${badgeConfig.grad} border-2 ${badgeConfig.border} rounded-2xl p-7 relative overflow-hidden`}>
            <span className={`absolute top-0 right-0 ${badgeConfig.cls} text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl tracking-wider`}>
              {badgeConfig.label}
            </span>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">After</p>
            <p className="text-slate-800 font-semibold mb-5">Re-Simulated Prediction</p>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">CTR</p>
                <p className={`font-bold transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} text-slate-800`}>
                  {opt.ctr_range}
                </p>
                {Math.abs(ctrMidDiff) > 0.1 && (
                  <p className={`text-[10px] font-bold mt-0.5 ${ctrMidDiff > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {ctrMidDiff > 0 ? '↑' : '↓'} {Math.abs(ctrMidDiff).toFixed(1)}pp
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">ROI</p>
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full border transition-all duration-700 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'} ${roiPillCls(opt.roi_direction)}`}>
                  {opt.roi_direction}
                </span>
                {roiChanged && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    was <span className="font-semibold">{orig.roi_direction}</span>
                  </p>
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Confidence</p>
                <p className={`font-bold transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} text-indigo-700`}>
                  {opt.confidence_level}
                </p>
                {confChanged && (
                  <p className="text-[10px] text-slate-400 mt-0.5">was <span className="font-semibold">{orig.confidence_level}</span></p>
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Optimized Copy</p>
              <p className="text-slate-700 text-xs leading-relaxed line-clamp-3">{result.optimized_copy}</p>
            </div>
          </div>
        </div>

        {/* Delta summary row */}
        {comparison !== 'similar' && (roiChanged || confChanged || Math.abs(ctrMidDiff) > 0.1) && (
          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            {roiChanged && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${ROI_ORDER[opt.roi_direction] > ROI_ORDER[orig.roi_direction] ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                ROI: {orig.roi_direction} → {opt.roi_direction}
              </span>
            )}
            {confChanged && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${CONF_ORDER[opt.confidence_level] > CONF_ORDER[orig.confidence_level] ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                Confidence: {orig.confidence_level} → {opt.confidence_level}
              </span>
            )}
            {Math.abs(ctrMidDiff) > 0.1 && (
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${ctrMidDiff > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                CTR midpoint {ctrMidDiff > 0 ? '+' : ''}{ctrMidDiff.toFixed(1)}pp
              </span>
            )}
          </div>
        )}
        {comparison === 'similar' && (
          <p className="mt-4 text-center text-xs text-slate-400">Re-simulation produced similar results — the original campaign's core metrics are within normal variance.</p>
        )}
      </div>
    </section>
  )
}

// ── QA Review Panel ───────────────────────────────────────────────────────────

function verdictStyle(verdict: QAReview['verdict']) {
  if (verdict === 'Pass')
    return { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-600', text: 'text-emerald-700', icon: '✓' }
  if (verdict === 'Partial Pass')
    return { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-500', text: 'text-amber-700', icon: '~' }
  return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-600', text: 'text-red-700', icon: '!' }
}

function severityStyle(s: 'low' | 'medium' | 'high') {
  if (s === 'high') return 'bg-red-100 text-red-700 border-red-200'
  if (s === 'medium') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-slate-100 text-slate-600 border-slate-200'
}

function QAReviewPanel({ qa }: { qa: QAReview }) {
  const vs = verdictStyle(qa.verdict)
  const [expanded, setExpanded] = useState(false)

  return (
    <section className={`px-8 py-5 border-b ${vs.bg} ${vs.border} border-x-0`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start gap-5 flex-wrap">

          {/* Verdict badge */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className={`w-10 h-10 rounded-full ${vs.badge} flex items-center justify-center text-white font-black text-lg`}>
              {vs.icon}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">QA Reviewer</p>
              <p className={`font-bold text-sm ${vs.text}`}>{qa.verdict}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-slate-200 hidden sm:block" />

          {/* Confidence score */}
          <div className="flex-shrink-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Simulation Confidence</p>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black ${vs.text}`}>{qa.confidence_score}</span>
              <span className="text-slate-400 text-sm font-medium">/ 100</span>
              <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden ml-1">
                <div
                  className={`h-full rounded-full ${qa.confidence_score >= 70 ? 'bg-emerald-500' : qa.confidence_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${qa.confidence_score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-slate-200 hidden sm:block" />

          {/* Reviewer notes */}
          <div className="flex-1 min-w-[200px]">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Reviewer Notes</p>
            <p className="text-slate-700 text-sm leading-relaxed">{qa.reviewer_notes}</p>
          </div>

          {/* Flags toggle */}
          {qa.flags.length > 0 && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex-shrink-0 flex items-center gap-2 text-xs font-semibold text-slate-600 border border-slate-300 bg-white px-3 py-1.5 rounded-lg hover:border-amber-400 hover:text-amber-700 transition-all"
            >
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black">
                {qa.flags.length}
              </span>
              {expanded ? 'Hide flags' : 'View flags'}
            </button>
          )}

          {/* No flags indicator */}
          {qa.flags.length === 0 && (
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex-shrink-0">
              No issues found
            </span>
          )}
        </div>

        {/* Expanded flags */}
        {expanded && qa.flags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid gap-2 sm:grid-cols-2">
            {qa.flags.map((flag, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 flex gap-3 items-start">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 mt-0.5 uppercase tracking-wide ${severityStyle(flag.severity)}`}>
                  {flag.severity}
                </span>
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">{flag.section}</p>
                  <p className="text-slate-700 text-xs leading-relaxed">{flag.issue}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ResultsPage({ result, campaignSummary, onReset }: Props) {
  const score = result.campaign_analysis.overall_score
  const animatedScore = useCountUp(score, 1400)
  const [curtainGone, setCurtainGone] = useState(false)
  const { forecast } = result
  const spark = sparkValues(forecast.roi_direction)
  const ss = scoreStyle(score)

  // Confidence breakdown from dimension scores
  const ds = result.campaign_analysis.dimension_scores
  const toneCopyPct = Math.round((ds.emotional_tone + ds.cta_strength + ds.clarity + ds.emotional_appeal) / 4 * 10)
  const audiencePct = ds.audience_fit * 10
  const trustPct = ds.trust_signals * 10
  const overallPct = Math.round((toneCopyPct + audiencePct + trustPct) / 3)

  // Confidence dot count
  const filledDots = forecast.confidence_level === 'High' ? 3 : forecast.confidence_level === 'Medium' ? 2 : 1

  useEffect(() => {
    const t = setTimeout(() => setCurtainGone(true), 700)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">

      {/* Curtain reveal */}
      {!curtainGone && (
        <div
          className="fixed inset-0 bg-[#0F172A] z-50 pointer-events-none transition-opacity duration-700"
          style={{ opacity: curtainGone ? 0 : 1 }}
        />
      )}

      {/* ── Top Bar ── */}
      <header className="h-[60px] bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-base">+</div>
            <span className="text-base font-bold text-slate-900 tracking-tight">BrandAid</span>
          </div>
          <span className="text-slate-300 text-sm">›</span>
          <span className="text-sm text-slate-600 font-medium truncate max-w-[220px]">
            {campaignSummary?.objective || 'Simulation Results'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold bg-white hover:border-indigo-400 hover:text-indigo-700 transition-all duration-150"
          >
            ↺ Rerun with edits
          </button>
          <button
            onClick={() => openLaunchPlan(result, campaignSummary)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150"
          >
            Get Launch Plan →
          </button>
        </div>
      </header>

      {/* ── Hero (dark midnight) ── */}
      <section className="bg-[#0F172A] px-8 py-12 text-white">
        <div className="max-w-5xl mx-auto">

          {/* Status row */}
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <span className="text-[11px] font-semibold tracking-widest text-slate-500 uppercase">
              SIM-{Date.now().toString(36).slice(-6).toUpperCase()}
            </span>
            <span className="w-px h-4 bg-slate-700" />
            <span className="inline-flex items-center gap-2 bg-emerald-500/[0.2] border border-emerald-500/[0.4] text-emerald-400 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Simulation Complete
            </span>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Confidence</span>
              <span className="text-sm font-semibold" style={{ color: levelColor(forecast.confidence_level) }}>
                {forecast.confidence_level}
              </span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < filledDots ? 'bg-emerald-500' : 'border border-slate-600'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Campaign heading + tags */}
          <h1 className="text-4xl font-black tracking-tight mb-3 leading-tight">
            {campaignSummary?.objective || 'Campaign Analysis'}
          </h1>
          <div className="flex gap-2 flex-wrap mb-8">
            {campaignSummary?.platform && (
              <span className="bg-emerald-500/[0.15] text-emerald-400 text-[11px] font-semibold px-3 py-1 rounded-full">
                {campaignSummary.platform}
              </span>
            )}
            <span
              className="text-[11px] font-semibold px-3 py-1 rounded-full"
              style={{ background: forecast.roi_direction === 'Positive' ? 'rgba(52,211,153,0.15)' : forecast.roi_direction === 'Negative' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)', color: roiColor(forecast.roi_direction) }}
            >
              ROI: {forecast.roi_direction}
            </span>
            <span className="bg-emerald-500/[0.15] text-emerald-400 text-[11px] font-semibold px-3 py-1 rounded-full">
              Confidence: {forecast.confidence_level}
            </span>
          </div>

          {/* 4 Metric cards */}
          <div className="grid grid-cols-4 gap-4">

            {/* Campaign Score */}
            <div className="bg-white/[0.06] border border-white/[0.12] rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-3">Campaign Score</p>
              <p className="text-5xl font-black tracking-tight leading-none mb-2" style={{ color: ss.color }}>
                {animatedScore}
              </p>
              <p className="text-slate-500 text-xs">/100 quality score</p>
            </div>

            {/* CTR Range */}
            <div className="bg-white/[0.06] border border-white/[0.12] rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">CTR Range</p>
                <Sparkline values={spark} color="#34D399" />
              </div>
              <p className="text-xl font-bold text-white leading-tight">{forecast.ctr_range}</p>
              <p className="text-slate-500 text-xs mt-1">click-through rate</p>
            </div>

            {/* Engagement */}
            <div className="bg-white/[0.06] border border-white/[0.12] rounded-2xl p-6 backdrop-blur-sm">
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-3">Engagement</p>
              <p className="text-white text-sm font-medium leading-relaxed">{forecast.engagement_estimate}</p>
            </div>

            {/* ROI Direction */}
            <div
              className="border rounded-2xl p-6 backdrop-blur-sm"
              style={{
                background: forecast.roi_direction === 'Positive' ? 'rgba(52,211,153,0.12)' : forecast.roi_direction === 'Negative' ? 'rgba(248,113,113,0.12)' : 'rgba(251,191,36,0.12)',
                borderColor: forecast.roi_direction === 'Positive' ? 'rgba(52,211,153,0.3)' : forecast.roi_direction === 'Negative' ? 'rgba(248,113,113,0.3)' : 'rgba(251,191,36,0.3)',
              }}
            >
              <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold mb-3">ROI Direction</p>
              <p className="text-4xl font-black" style={{ color: roiColor(forecast.roi_direction) }}>
                {forecast.roi_direction}
              </p>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">{forecast.conversion_trend}</p>
            </div>
          </div>

          {/* Confidence breakdown */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center gap-6 flex-wrap">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold flex-shrink-0">
              AI Confidence Breakdown
            </span>
            <div className="flex gap-6 flex-1 justify-center flex-wrap">
              {[
                { label: 'Tone & Copy', pct: toneCopyPct },
                { label: 'Audience Fit', pct: audiencePct },
                { label: 'Trust Signals', pct: trustPct },
              ].map(({ label, pct }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-[10px] text-slate-500">{label}</span>
                  <div className="w-24 h-1 bg-white/[0.1] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <span className="text-emerald-400 text-sm font-semibold flex-shrink-0">
              {overallPct}% Overall
            </span>
          </div>
        </div>
      </section>

      {/* ── QA Review Panel ── */}
      {result.qa_review && <QAReviewPanel qa={result.qa_review} />}

      {/* ── Body (light 2-column) ── */}
      <section className="px-8 py-10">
        <div className="max-w-5xl mx-auto grid grid-cols-[1fr_0.72fr] gap-6 items-start">

          {/* LEFT */}
          <div className="space-y-5">

            {/* Campaign Analysis */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-end justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900">Campaign Analysis</h2>
                <span className="text-xs text-slate-400">6 criteria evaluated</span>
              </div>
              <AnalysisSplit analysis={result.campaign_analysis} />
            </div>

            {/* Recommendations */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-end justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900">AI Recommendations</h2>
                <span className="text-xs text-slate-400">Ranked by predicted impact</span>
              </div>
              <RankedRecs recs={result.recommendations} />
            </div>

            {/* Persona Reactions */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Audience Reactions</h2>
              <div className="space-y-3">
                {result.personas.map(p => (
                  <PersonaCard key={p.persona_name} persona={p} />
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-5">

            {/* Radar score card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-end justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Quality Score</h2>
                <span className="text-xs text-slate-400">6 dimensions</span>
              </div>
              <div className="max-w-[280px] mx-auto">
                <RadarChart scores={result.campaign_analysis.dimension_scores} />
              </div>
              <div className="text-center mt-4">
                <div className="text-3xl font-black" style={{ color: ss.color }}>
                  {score} <span className="text-xl text-slate-400 font-normal">/ 100</span>
                </div>
                <p className="text-slate-500 text-xs uppercase tracking-wider mt-1">Quality Score</p>
                <span
                  className="inline-block mt-2 text-xs font-semibold px-3 py-1.5 rounded-full border"
                  style={{ background: ss.bg, color: ss.text, borderColor: ss.border }}
                >
                  {scoreVerdict(score)}
                </span>
              </div>
            </div>

            {/* Risks */}
            {result.risks.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Identified Risks</h2>
                <div className="space-y-3">
                  {result.risks.map((risk, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-700 text-[10px] font-bold">⚠</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── Before / After ── */}
      <BeforeAfter result={result} originalAdCopy={campaignSummary?.ad_copy ?? ''} />

      {/* ── Sticky Bottom Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-8 py-4 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 truncate max-w-[220px]">
                {campaignSummary?.objective || 'Campaign Results'}
              </p>
              <p className="text-xs text-slate-500">
                {campaignSummary?.platform || 'AI Simulation'} · Score {score}/100
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-400 text-center flex-1 min-w-[180px] hidden lg:block">
            Not satisfied? Apply more recommendations and rerun.
          </p>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={onReset}
              className="border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white hover:border-indigo-400 hover:text-indigo-700 transition-all duration-150"
            >
              ← Rerun with edits
            </button>
            <button
              onClick={() => openLaunchPlan(result, campaignSummary)}
              className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_6px_16px_-4px_rgba(5,150,105,0.5)] hover:shadow-[0_10px_24px_-4px_rgba(5,150,105,0.65)] hover:-translate-y-0.5 transition-all duration-200"
            >
              → Get Launch Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
