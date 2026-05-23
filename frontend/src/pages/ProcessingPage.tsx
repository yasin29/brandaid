import { useEffect, useState } from 'react'

const STAGES = [
  { label: 'Campaign Analysis', description: 'Analyzing tone, CTA strength, and trust signals' },
  { label: 'Persona Generation', description: 'Building 3 synthetic audience profiles' },
  { label: 'Audience Simulation', description: 'Simulating per-persona reactions and objections' },
  { label: 'Forecast Engine', description: 'Projecting CTR, ROI, and conversion trends' },
  { label: 'Recommendation Engine', description: 'Generating optimization strategies' },
  { label: 'Re-Simulation', description: 'Running optimized campaign for comparison' },
]

export default function ProcessingPage() {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex(i => Math.min(i + 1, STAGES.length - 1))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const progress = Math.round(((stageIndex + 1) / STAGES.length) * 100)

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(109,40,217,0.12)_0%,_transparent_65%)] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Pulsing orb */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-violet-600/15 animate-ping" style={{ animationDuration: '1.5s' }} />
          <div className="absolute inset-2 rounded-full bg-violet-700/25 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-violet-600 flex items-center justify-center shadow-[0_0_20px_rgba(109,40,217,0.6)]">
            <span className="text-white text-lg font-bold">{stageIndex + 1}</span>
          </div>
        </div>

        {/* Current stage info */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-1">{STAGES[stageIndex].label}</h2>
          <p className="text-slate-400 text-sm">{STAGES[stageIndex].description}</p>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-white/5 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(139,92,246,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stage list */}
        <div className="space-y-1.5">
          {STAGES.map((stage, i) => (
            <div
              key={stage.label}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-500 ${
                i === stageIndex
                  ? 'bg-violet-950/50 border border-violet-700/30'
                  : ''
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 transition-all duration-300 ${
                  i < stageIndex
                    ? 'bg-emerald-600 text-white'
                    : i === stageIndex
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/5 text-slate-600'
                }`}
              >
                {i < stageIndex ? '✓' : i + 1}
              </div>
              <span
                className={`text-sm transition-all duration-300 ${
                  i < stageIndex
                    ? 'text-slate-500'
                    : i === stageIndex
                    ? 'text-white font-medium'
                    : 'text-slate-600'
                }`}
              >
                {stage.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
