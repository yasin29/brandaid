import { useState } from 'react'
import type { SimulationResult } from '@/types'
import { saveSimulation } from '@/lib/history'
import InputPage from '@/pages/InputPage'
import ProcessingPage from '@/pages/ProcessingPage'
import ResultsPage from '@/pages/ResultsPage'

type Step = 'input' | 'processing' | 'results'
type CampaignMeta = { objective: string; platform: string; ad_copy: string }

export default function NewCampaignPage() {
  const [step, setStep] = useState<Step>('input')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [meta, setMeta] = useState<CampaignMeta | null>(null)

  function handleStart(summary: { objective: string; platform: string }, adCopy: string) {
    setMeta({ objective: summary.objective, platform: summary.platform, ad_copy: adCopy })
    setStep('processing')
  }

  function handleComplete(r: SimulationResult) {
    setResult(r)
    if (meta) saveSimulation(r, meta)
    setStep('results')
  }

  function handleReset() {
    setResult(null)
    setMeta(null)
    setStep('input')
  }

  return (
    <div className="min-h-full">
      {step === 'input' && (
        <InputPage
          onSimulationStart={(summary, adCopy) => handleStart(summary, adCopy)}
          onSimulationComplete={handleComplete}
          onError={() => setStep('input')}
        />
      )}
      {step === 'processing' && <ProcessingPage />}
      {step === 'results' && result && (
        <ResultsPage
          result={result}
          campaignSummary={meta}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
