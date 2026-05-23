import type { SimulationResult, ForecastMetrics } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Props {
  result: SimulationResult
  onReset: () => void
}

function levelBadge(level: 'Low' | 'Medium' | 'High') {
  const styles = {
    High: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/15',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/25 hover:bg-amber-500/15',
    Low: 'bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/15',
  }
  return styles[level]
}

function roiStyle(dir: 'Negative' | 'Neutral' | 'Positive') {
  return dir === 'Positive' ? 'text-emerald-400' : dir === 'Negative' ? 'text-red-400' : 'text-amber-400'
}

function scoreStyle(score: number) {
  return score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'
}

function ForecastTiles({ forecast }: { forecast: ForecastMetrics }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 text-center">
        <p className="text-slate-500 text-xs mb-1">CTR Range</p>
        <p className="text-white font-bold text-lg">{forecast.ctr_range}</p>
      </div>
      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 text-center">
        <p className="text-slate-500 text-xs mb-1">ROI Direction</p>
        <p className={`font-bold text-lg ${roiStyle(forecast.roi_direction)}`}>{forecast.roi_direction}</p>
      </div>
      <div className="bg-white/[0.03] border border-white/10 rounded-lg p-4 text-center">
        <p className="text-slate-500 text-xs mb-1">Confidence</p>
        <Badge className={`text-sm ${levelBadge(forecast.confidence_level)}`}>{forecast.confidence_level}</Badge>
      </div>
    </div>
  )
}

const ANALYSIS_LABELS: Record<string, string> = {
  emotional_tone: 'Emotional Tone',
  cta_strength: 'CTA Strength',
  audience_fit: 'Audience Fit',
  trust_signals: 'Trust Signals',
  clarity: 'Clarity',
  emotional_appeal: 'Emotional Appeal',
}

export default function ResultsPage({ result, onReset }: Props) {
  const score = result.campaign_analysis.overall_score

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(109,40,217,0.07)_0%,_transparent_55%)] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Simulation Results</h1>
            <p className="text-slate-500 text-sm mt-0.5">AI-generated campaign performance forecast</p>
          </div>
          <Button
            variant="outline"
            onClick={onReset}
            className="border-white/10 text-slate-300 hover:text-white hover:bg-white/5 bg-transparent"
          >
            ← New Simulation
          </Button>
        </div>

        {/* Campaign Score */}
        <Card className="bg-white/[0.03] border border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="text-slate-300 text-sm font-medium tracking-wide uppercase">Campaign Score</CardTitle>
              <span className={`text-5xl font-black tabular-nums ${scoreStyle(score)}`}>
                {score}<span className="text-2xl text-slate-600 font-normal">/100</span>
              </span>
            </div>
            <Separator className="bg-white/5 mb-4" />
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(result.campaign_analysis)
                .filter(([k]) => k !== 'overall_score')
                .map(([key, val]) => (
                  <div key={key} className="space-y-0.5">
                    <p className="text-slate-500 text-xs">{ANALYSIS_LABELS[key] ?? key}</p>
                    <p className="text-slate-200 text-sm">{val as string}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Audience Reactions */}
        <div>
          <h2 className="text-slate-300 text-sm font-medium tracking-wide uppercase mb-3">Audience Reactions</h2>
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
                      <Badge className={`text-xs ${levelBadge(p.engagement_likelihood)}`}>
                        Engagement · {p.engagement_likelihood}
                      </Badge>
                      <Badge className={`text-xs ${levelBadge(p.trust_level)}`}>
                        Trust · {p.trust_level}
                      </Badge>
                      <Badge className={`text-xs ${levelBadge(p.conversion_likelihood)}`}>
                        Conversion · {p.conversion_likelihood}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{p.emotional_reaction}</p>
                  {p.objections.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.objections.map((obj, i) => (
                        <span key={i} className="text-xs bg-white/5 text-slate-400 border border-white/10 px-2 py-0.5 rounded-full">
                          {obj}
                        </span>
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
          <h2 className="text-slate-300 text-sm font-medium tracking-wide uppercase mb-3">Performance Forecast</h2>
          <ForecastTiles forecast={result.forecast} />
          {result.forecast.engagement_estimate && (
            <p className="text-slate-500 text-xs mt-2">{result.forecast.engagement_estimate}</p>
          )}
          {result.forecast.conversion_trend && (
            <p className="text-slate-500 text-xs mt-1">{result.forecast.conversion_trend}</p>
          )}
        </div>

        {/* Risks */}
        {result.risks.length > 0 && (
          <div>
            <h2 className="text-slate-300 text-sm font-medium tracking-wide uppercase mb-3">Identified Risks</h2>
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
          <h2 className="text-slate-300 text-sm font-medium tracking-wide uppercase mb-3">Recommendations</h2>
          <Card className="bg-white/[0.03] border border-white/10">
            <CardContent className="p-4 space-y-3">
              {[
                { label: 'Improved CTA', value: result.recommendations.improved_cta },
                { label: 'Stronger Messaging', value: result.recommendations.stronger_messaging },
                { label: 'Audience Refinement', value: result.recommendations.audience_refinement },
                { label: 'Platform Strategy', value: result.recommendations.platform_strategy },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-slate-500 text-xs mb-0.5">{label}</p>
                  <p className="text-slate-200 text-sm">{value}</p>
                </div>
              ))}
              {result.recommendations.optimization_tips.length > 0 && (
                <>
                  <Separator className="bg-white/5" />
                  <div>
                    <p className="text-slate-500 text-xs mb-2">Optimization Tips</p>
                    <ul className="space-y-1.5">
                      {result.recommendations.optimization_tips.map((tip, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-violet-400 flex-shrink-0">›</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Optimized Campaign Comparison */}
        {result.optimized_copy && (
          <div>
            <h2 className="text-slate-300 text-sm font-medium tracking-wide uppercase mb-3">Optimized Campaign</h2>
            <Card className="bg-violet-950/20 border border-violet-700/25">
              <CardContent className="p-4 space-y-4">
                <div>
                  <p className="text-slate-500 text-xs mb-2">Rewritten Ad Copy</p>
                  <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{result.optimized_copy}</p>
                </div>
                {result.optimized_forecast && (
                  <>
                    <Separator className="bg-white/5" />
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-slate-500 text-xs">Original forecast</p>
                        <p className="text-violet-400 text-xs font-medium">→ Optimized forecast</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center text-sm">
                        <div>
                          <p className="text-slate-500 text-xs mb-1">CTR</p>
                          <p className="text-slate-400 line-through text-xs">{result.forecast.ctr_range}</p>
                          <p className="text-emerald-400 font-semibold">{result.optimized_forecast.ctr_range}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">ROI</p>
                          <p className={`line-through text-xs ${roiStyle(result.forecast.roi_direction)}`}>{result.forecast.roi_direction}</p>
                          <p className={`font-semibold ${roiStyle(result.optimized_forecast.roi_direction)}`}>{result.optimized_forecast.roi_direction}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 text-xs mb-1">Confidence</p>
                          <p className="text-slate-400 line-through text-xs">{result.forecast.confidence_level}</p>
                          <Badge className={`text-xs ${levelBadge(result.optimized_forecast.confidence_level)}`}>
                            {result.optimized_forecast.confidence_level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  )
}
