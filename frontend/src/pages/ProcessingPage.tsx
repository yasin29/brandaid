import { useEffect, useState } from 'react'

const STAGES = [
  'Analyzing campaign...',
  'Generating audience personas...',
  'Simulating reactions...',
  'Forecasting performance...',
  'Generating recommendations...',
  'Running optimized simulation...',
]

export default function ProcessingPage() {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex(i => Math.min(i + 1, STAGES.length - 1))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Placeholder animation — will be replaced with cinematic UI */}
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xl text-foreground font-medium">{STAGES[stageIndex]}</p>
        <p className="text-muted-foreground text-sm">AI simulation in progress</p>
      </div>
    </div>
  )
}
