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
import type { SimulationResult, DimensionScores } from '@/types'

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

interface Props {
  result: SimulationResult
  campaignSummary: { objective: string; platform: string } | null
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
            pointLabels: { font: { size: 11, weight: '600' }, color: '#64748B' },
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

function BeforeAfter({ result }: { result: SimulationResult }) {
  if (!result.optimized_copy || !result.optimized_forecast) return null
  const orig = result.forecast
  const opt = result.optimized_forecast

  return (
    <section className="bg-white border-t-2 border-emerald-100 px-8 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
          <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full uppercase tracking-wider">Before</span>
          <span className="text-emerald-500 text-xl font-bold">→ →</span>
          <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full uppercase tracking-wider">After Recommendations</span>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Before */}
          <div className="bg-white border-[1.5px] border-slate-200 rounded-2xl p-7">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Before</p>
            <p className="text-slate-500 font-semibold mb-5">Original Prediction</p>
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
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">Ad Copy</p>
              <p className="text-slate-400 text-xs leading-relaxed line-through line-clamp-3">
                {result.optimized_copy.substring(0, 120)}...
              </p>
            </div>
          </div>

          {/* After */}
          <div className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-500 rounded-2xl p-7 relative">
            <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl tracking-wider">
              Improved ✓
            </span>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1">After</p>
            <p className="text-slate-800 font-semibold mb-5">Optimized Prediction</p>
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'CTR', value: opt.ctr_range, cls: 'text-emerald-700' },
                { label: 'ROI', value: opt.roi_direction, cls: opt.roi_direction === 'Positive' ? 'text-emerald-700' : 'text-amber-700' },
                { label: 'Confidence', value: opt.confidence_level, cls: 'text-indigo-700' },
              ].map(({ label, value, cls }) => (
                <div key={label}>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">{label}</p>
                  <p className={`font-bold ${cls}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-emerald-100">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-2">Optimized Copy</p>
              <p className="text-slate-700 text-xs leading-relaxed line-clamp-3">{result.optimized_copy}</p>
            </div>
          </div>
        </div>
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
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150">
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
      <BeforeAfter result={result} />

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
            <button className="bg-gradient-to-br from-emerald-600 to-emerald-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_6px_16px_-4px_rgba(5,150,105,0.5)] hover:shadow-[0_10px_24px_-4px_rgba(5,150,105,0.65)] hover:-translate-y-0.5 transition-all duration-200">
              → Get Launch Plan
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
