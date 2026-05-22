import type { SimulationResult } from '@/types'

interface Props {
  result: SimulationResult
  onReset: () => void
}

export default function ResultsPage({ result, onReset }: Props) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Simulation Results</h1>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            New Simulation
          </button>
        </div>

        {/* Campaign Analysis */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">Campaign Analysis</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(result.campaign_analysis)
              .filter(([k]) => k !== 'overall_score')
              .map(([key, val]) => (
                <div key={key} className="p-3 rounded-lg bg-card border border-border">
                  <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-foreground font-medium">{val as string}</p>
                </div>
              ))}
          </div>
          <p className="mt-3 text-muted-foreground">
            Overall Score: <span className="text-foreground font-bold text-2xl">{result.campaign_analysis.overall_score}/100</span>
          </p>
        </section>

        {/* Persona Reactions */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">Audience Reactions</h2>
          <div className="space-y-4">
            {result.personas.map(p => (
              <div key={p.persona_name} className="p-4 rounded-lg bg-card border border-border">
                <p className="font-semibold text-foreground">{p.persona_name} — {p.persona_type}</p>
                <p className="text-muted-foreground text-sm mt-1">{p.emotional_reaction}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>Engagement: <strong>{p.engagement_likelihood}</strong></span>
                  <span>Trust: <strong>{p.trust_level}</strong></span>
                  <span>Conversion: <strong>{p.conversion_likelihood}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Forecast */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">Performance Forecast</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-card border border-border text-center">
              <p className="text-xs text-muted-foreground">CTR Range</p>
              <p className="text-xl font-bold text-foreground">{result.forecast.ctr_range}</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border text-center">
              <p className="text-xs text-muted-foreground">ROI Direction</p>
              <p className="text-xl font-bold text-foreground">{result.forecast.roi_direction}</p>
            </div>
            <div className="p-4 rounded-lg bg-card border border-border text-center">
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className="text-xl font-bold text-foreground">{result.forecast.confidence_level}</p>
            </div>
          </div>
        </section>

        {/* Risks */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">Identified Risks</h2>
          <ul className="space-y-2">
            {result.risks.map((risk, i) => (
              <li key={i} className="flex gap-2 text-muted-foreground">
                <span className="text-destructive">⚠</span> {risk}
              </li>
            ))}
          </ul>
        </section>

        {/* Recommendations */}
        <section>
          <h2 className="text-xl font-semibold mb-3 text-foreground">Recommendations</h2>
          <div className="p-4 rounded-lg bg-card border border-border space-y-3">
            <p><span className="text-muted-foreground text-sm">Improved CTA:</span> <span className="text-foreground">{result.recommendations.improved_cta}</span></p>
            <p><span className="text-muted-foreground text-sm">Stronger Messaging:</span> <span className="text-foreground">{result.recommendations.stronger_messaging}</span></p>
            <ul className="list-disc list-inside text-foreground space-y-1">
              {result.recommendations.optimization_tips.map((tip, i) => (
                <li key={i} className="text-sm">{tip}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Optimized Version */}
        {result.optimized_copy && (
          <section>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Optimized Campaign</h2>
            <div className="p-4 rounded-lg bg-card border border-border">
              <p className="text-muted-foreground text-sm mb-2">Rewritten Copy:</p>
              <p className="text-foreground whitespace-pre-wrap">{result.optimized_copy}</p>
              {result.optimized_forecast && (
                <div className="mt-4 flex gap-4 text-sm">
                  <span>CTR: <strong>{result.optimized_forecast.ctr_range}</strong></span>
                  <span>ROI: <strong>{result.optimized_forecast.roi_direction}</strong></span>
                  <span>Confidence: <strong>{result.optimized_forecast.confidence_level}</strong></span>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
