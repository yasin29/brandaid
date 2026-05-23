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
import type { SimulationResult, ForecastMetrics, DimensionScores } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

interface Props {
  result: SimulationResult
  onReset: () => void
}

// ── helpers ──────────────────────────────────────────────────────────────────

function levelBadge(level: 'Low' | 'Medium' | 'High') {
  const s = {
    High: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/15',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/25 hover:bg-amber-500/15',
    Low: 'bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/15',
  }
  return s[level]
}

function roiColor(dir: 'Negative' | 'Neutral' | 'Positive') {
  return dir === 'Positive' ? 'text-emerald-400' : dir === 'Negative' ? 'text-red-400' : 'text-amber-400'
}

function scoreColor(score: number) {
  return score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'
}

function scoreVerdict(score: number) {
  return score >= 75 ? 'Strong — likely to perform well'
    : score >= 55 ? 'Moderate — has clear improvement areas'
    : 'Needs work — significant gaps identified'
}

function useCountUp(target: number, duration = 1200) {
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

// SVG sparkline from an array of 0–1 normalised values
function Sparkline({ values, color = '#8b5cf6' }: { values: number[]; color?: string }) {
  const w = 72; const h = 28
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - v * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const d = `M ${pts.join(' L ')}`
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <path d={d} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </svg>
  )
}

function forecastSparkValues(roi: string, confidence: string) {
  const up = [0.3, 0.4, 0.45, 0.55, 0.65, 0.75]
  const down = [0.75, 0.65, 0.55, 0.45, 0.4, 0.3]
  const flat = [0.45, 0.5, 0.48, 0.52, 0.5, 0.55]
  if (roi === 'Positive') return confidence === 'High' ? up.map(v => v + 0.1) : up
  if (roi === 'Negative') return down
  return flat
}

// ── Radar chart ──────────────────────────────────────────────────────────────

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
          backgroundColor: 'rgba(124,58,237,0.15)',
          borderColor: '#7c3aed',
          borderWidth: 2,
          pointBackgroundColor: '#7c3aed',
          pointRadius: 3,
          pointHoverRadius: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            min: 0,
            max: 10,
            ticks: { display: false, stepSize: 2 },
            grid: { color: 'rgba(255,255,255,0.06)' },
            angleLines: { color: 'rgba(255,255,255,0.06)' },
            pointLabels: {
              font: { size: 11, family: 'Geist Variable, sans-serif', weight: '500' },
              color: '#94a3b8',
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1e1e2e',
            titleFont: { family: 'Geist Variable, sans-serif', size: 11 },
            bodyFont: { family: 'Geist Variable, sans-serif', size: 12 },
            padding: 10,
            callbacks: {
              title: (ctx) => ctx[0].label,
              label: (ctx) => `Score: ${ctx.parsed.r} / 10`,
            },
          },
        },
        animation: { duration: 1000, easing: 'easeInOutQuart' },
      },
    })
    return () => { chartRef.current?.destroy(); chartRef.current = null }
  }, [scores])

  return <canvas ref={canvasRef} />
}

// ── What's Working / Watch out ────────────────────────────────────────────────

const DIMENSION_KEYS = [
  'emotional_tone', 'cta_strength', 'audience_fit',
  'trust_signals', 'clarity', 'emotional_appeal',
] as const

const ANALYSIS_LABELS: Record<string, string> = {
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
    <div className="space-y-4">
      {working.length > 0 && (
        <div>
          <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full mb-2">
            <span>✓</span> What's Working
          </div>
          <div className="space-y-2">
            {working.map(k => (
              <div key={k} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-400 text-[10px] font-bold">✓</span>
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-medium">{ANALYSIS_LABELS[k]}: {analysis.dimension_scores[k]}/10</p>
                  <p className="text-slate-500 text-xs">{analysis[k]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {watchOut.length > 0 && (
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-semibold bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full mb-2">
            <span>⚠</span> Watch Out For
          </div>
          <div className="space-y-2">
            {watchOut.map(k => (
              <div key={k} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-400 text-[10px] font-bold">⚠</span>
                </div>
                <div>
                  <p className="text-slate-200 text-sm font-medium">{ANALYSIS_LABELS[k]}: {analysis.dimension_scores[k]}/10</p>
                  <p className="text-slate-500 text-xs">{analysis[k]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Forecast tiles ────────────────────────────────────────────────────────────

function ForecastTile({
  label, value, colorClass, spark,
}: { label: string; value: string; colorClass: string; spark: number[] }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-500 text-xs uppercase tracking-wide">{label}</p>
        <Sparkline values={spark} color={colorClass.includes('emerald') ? '#10b981' : colorClass.includes('amber') ? '#f59e0b' : '#8b5cf6'} />
      </div>
      <p className={`font-bold text-xl ${colorClass}`}>{value}</p>
    </div>
  )
}

function ForecastTiles({ forecast }: { forecast: ForecastMetrics }) {
  const spark = forecastSparkValues(forecast.roi_direction, forecast.confidence_level)
  return (
    <div className="grid grid-cols-3 gap-3">
      <ForecastTile label="CTR Range" value={forecast.ctr_range} colorClass="text-violet-400" spark={spark} />
      <ForecastTile
        label="ROI Direction"
        value={forecast.roi_direction}
        colorClass={roiColor(forecast.roi_direction)}
        spark={forecast.roi_direction === 'Positive' ? spark : forecast.roi_direction === 'Negative' ? spark.slice().reverse() : spark}
      />
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <div className="flex items-start justify-between mb-3">
          <p className="text-slate-500 text-xs uppercase tracking-wide">Confidence</p>
        </div>
        <Badge className={`text-sm ${levelBadge(forecast.confidence_level)}`}>{forecast.confidence_level}</Badge>
      </div>
    </div>
  )
}

// ── Ranked recommendations ────────────────────────────────────────────────────

const REC_FIELDS = [
  { key: 'improved_cta', label: 'Improved CTA' },
  { key: 'stronger_messaging', label: 'Stronger Messaging' },
  { key: 'audience_refinement', label: 'Audience Refinement' },
  { key: 'platform_strategy', label: 'Platform Strategy' },
] as const

function RankedRecs({ recs }: { recs: SimulationResult['recommendations'] }) {
  return (
    <div className="space-y-3">
      {REC_FIELDS.map(({ key, label }, i) => (
        <div key={key} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex gap-4">
          <div className="flex-shrink-0">
            <p className="text-slate-600 text-[10px] font-bold tracking-widest">0{i + 1}</p>
            <div className="w-px h-full bg-white/5 mx-auto mt-1" />
          </div>
          <div className="min-w-0">
            <p className="text-slate-400 text-xs mb-0.5">{label}</p>
            <p className="text-slate-200 text-sm leading-relaxed">{recs[key]}</p>
          </div>
          <div className="flex-shrink-0 self-start">
            <svg className="text-violet-400 opacity-60" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 2 L8 14 M3 7 L8 2 L13 7" />
            </svg>
          </div>
        </div>
      ))}

      {recs.optimization_tips.length > 0 && (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
          <p className="text-slate-500 text-xs uppercase tracking-wide mb-2">Optimization Tips</p>
          <ul className="space-y-1.5">
            {recs.optimization_tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-violet-400 flex-shrink-0">›</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ── Before / After ────────────────────────────────────────────────────────────

function BeforeAfter({ result }: { result: SimulationResult }) {
  if (!result.optimized_copy) return null
  const orig = result.forecast
  const opt = result.optimized_forecast!

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="text-xs font-bold bg-white/5 border border-white/10 text-slate-400 px-3 py-1 rounded-full uppercase tracking-wide">Before</span>
        <span className="text-slate-600">→ →</span>
        <span className="text-xs font-bold bg-violet-500/15 border border-violet-500/25 text-violet-400 px-3 py-1 rounded-full uppercase tracking-wide">After Recommendations</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Before */}
        <div className="bg-white/[0.02] border border-white/8 rounded-xl p-5">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-1">Before</p>
          <p className="text-slate-400 text-sm font-medium mb-4">Original Prediction</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'CTR', value: orig.ctr_range },
              { label: 'ROI', value: orig.roi_direction },
              { label: 'Confidence', value: orig.confidence_level },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-slate-600 text-[10px] uppercase tracking-wide mb-1">{label}</p>
                <p className="text-slate-500 font-semibold line-through">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-slate-600 text-[10px] uppercase tracking-wide mb-2">Ad Copy</p>
            <p className="text-slate-500 text-xs line-through leading-relaxed line-clamp-3">{result.optimized_copy.substring(0, 120)}...</p>
          </div>
        </div>

        {/* After */}
        <div className="bg-violet-950/30 border-2 border-violet-700/30 rounded-xl p-5 relative">
          <span className="absolute top-0 right-0 bg-violet-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-bl-lg rounded-tr-xl">Improved ✓</span>
          <p className="text-violet-400 text-[10px] font-bold uppercase tracking-widest mb-1">After</p>
          <p className="text-slate-200 text-sm font-medium mb-4">Optimized Prediction</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'CTR', value: opt.ctr_range, color: 'text-emerald-400' },
              { label: 'ROI', value: opt.roi_direction, color: roiColor(opt.roi_direction) },
              { label: 'Confidence', value: opt.confidence_level, color: 'text-violet-400' },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-1">{label}</p>
                <p className={`font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-violet-700/20">
            <p className="text-slate-500 text-[10px] uppercase tracking-wide mb-2">Optimized Copy</p>
            <p className="text-slate-300 text-xs leading-relaxed line-clamp-3">{result.optimized_copy}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ResultsPage({ result, onReset }: Props) {
  const score = result.campaign_analysis.overall_score
  const animatedScore = useCountUp(score, 1400)
  const [curtainGone, setCurtainGone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setCurtainGone(true), 700)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Curtain reveal */}
      {!curtainGone && (
        <div
          className="fixed inset-0 bg-[#0a0a0f] z-50 pointer-events-none transition-opacity duration-700"
          style={{ opacity: curtainGone ? 0 : 1 }}
        />
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(109,40,217,0.07)_0%,_transparent_55%)] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 py-6 relative z-10 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Simulation Results</h1>
            <p className="text-slate-500 text-sm mt-0.5">AI-generated campaign performance forecast</p>
          </div>
          <Button variant="outline" onClick={onReset} className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 bg-transparent">
            ← New Simulation
          </Button>
        </div>

        {/* Score hero */}
        <Card className="bg-white/[0.03] border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Campaign Score</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-6xl font-black tabular-nums ${scoreColor(score)}`}>{animatedScore}</span>
                  <span className="text-2xl text-slate-600 font-normal">/100</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">{scoreVerdict(score)}</p>
              </div>
              <div className="w-48 h-48">
                <RadarChart scores={result.campaign_analysis.dimension_scores} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Campaign analysis split */}
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Campaign Analysis</p>
          <Card className="bg-white/[0.03] border border-white/10">
            <CardContent className="p-5">
              <AnalysisSplit analysis={result.campaign_analysis} />
            </CardContent>
          </Card>
        </div>

        {/* Persona reactions */}
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Audience Reactions</p>
          <div className="space-y-3">
            {result.personas.map(p => (
              <Card key={p.persona_name} className="bg-white/[0.03] border border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-white font-semibold">{p.persona_name}</p>
                      <p className="text-slate-500 text-xs">{p.persona_type}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                      <Badge className={`text-xs ${levelBadge(p.engagement_likelihood)}`}>Engagement · {p.engagement_likelihood}</Badge>
                      <Badge className={`text-xs ${levelBadge(p.trust_level)}`}>Trust · {p.trust_level}</Badge>
                      <Badge className={`text-xs ${levelBadge(p.conversion_likelihood)}`}>Conversion · {p.conversion_likelihood}</Badge>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{p.emotional_reaction}</p>
                  {p.objections.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.objections.map((obj, i) => (
                        <span key={i} className="text-xs bg-white/5 text-slate-400 border border-white/10 px-2 py-0.5 rounded-full">{obj}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Forecast */}
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Performance Forecast</p>
          <ForecastTiles forecast={result.forecast} />
          {(result.forecast.engagement_estimate || result.forecast.conversion_trend) && (
            <div className="mt-2 space-y-1">
              {result.forecast.engagement_estimate && <p className="text-slate-500 text-xs">{result.forecast.engagement_estimate}</p>}
              {result.forecast.conversion_trend && <p className="text-slate-500 text-xs">{result.forecast.conversion_trend}</p>}
            </div>
          )}
        </div>

        {/* Risks */}
        {result.risks.length > 0 && (
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Identified Risks</p>
            <Card className="bg-white/[0.03] border border-white/10">
              <CardContent className="p-4 space-y-2">
                {result.risks.map((risk, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠</span>
                    <p className="text-slate-300 text-sm">{risk}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations */}
        <div>
          <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">AI Recommendations</p>
          <RankedRecs recs={result.recommendations} />
        </div>

        {/* Before / After */}
        {result.optimized_copy && (
          <div>
            <p className="text-slate-500 text-xs uppercase tracking-widest mb-3">Optimized Campaign</p>
            <BeforeAfter result={result} />
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  )
}
