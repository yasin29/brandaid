import { useEffect, useState } from 'react'

const STAGES = [
  { label: 'Campaign Analysis',     description: 'Analyzing tone, CTA strength, and trust signals' },
  { label: 'Persona Generation',    description: 'Building 3 synthetic audience profiles' },
  { label: 'Audience Simulation',   description: 'Simulating per-persona reactions and objections' },
  { label: 'Forecast Engine',       description: 'Projecting CTR, ROI, and conversion trends' },
  { label: 'Recommendation Engine', description: 'Generating optimization strategies' },
  { label: 'Re-Simulation',         description: 'Running optimized campaign for comparison' },
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
    <div className="fixed inset-0 bg-[#0F172A] flex items-center justify-center z-50">
      <div className="w-full max-w-sm px-6">

        {/* Pulsing orb */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-indigo-600/15 animate-ping" style={{ animationDuration: '1.5s' }} />
          <div className="absolute inset-2 rounded-full bg-indigo-700/25 animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(67,56,202,0.6)]">
            <span className="text-white text-lg font-bold">{stageIndex + 1}</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-white">Running Simulation</h2>
          <p className="text-slate-400 text-sm mt-1">{STAGES[stageIndex].description}</p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/[0.08] rounded-full mt-6 mb-5 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Stage list */}
        <div className="space-y-1.5">
          {STAGES.map((stage, i) => (
            <div
              key={stage.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-500 ${
                i === stageIndex
                  ? 'bg-[#1E293B] border-[#334155]'
                  : 'border-transparent'
              }`}
            >
              {/* Status dot */}
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 transition-all duration-300 ${
                  i < stageIndex
                    ? 'bg-indigo-500'
                    : i === stageIndex
                    ? 'bg-indigo-500 animate-pulse'
                    : 'bg-[#334155]'
                }`}
              />

              <span
                className={`text-sm flex-1 transition-all duration-300 ${
                  i < stageIndex
                    ? 'text-[#64748B]'
                    : i === stageIndex
                    ? 'text-[#E2E8F0] font-medium'
                    : 'text-[#475569]'
                }`}
              >
                {stage.label}
              </span>

              {i < stageIndex && (
                <svg className="text-indigo-500 flex-shrink-0" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8L6.5 11.5L13 4.5" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
