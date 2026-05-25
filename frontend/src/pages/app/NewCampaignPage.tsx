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
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  function handleStart(summary: { objective: string; platform: string }, adCopy: string) {
    setErrorMsg(null)
    setMeta({ objective: summary.objective, platform: summary.platform, ad_copy: adCopy })
    setStep('processing')
  }

  function handleComplete(r: SimulationResult) {
    setResult(r)
    if (meta) {
      try { saveSimulation(r, meta) } catch { /* non-fatal */ }
    }
    setStep('results')
  }

  function handleError(msg: string) {
    setErrorMsg(msg || 'Simulation failed. Please try again.')
    setStep('input')
  }

  function handleReset() {
    setResult(null)
    setMeta(null)
    setErrorMsg(null)
    setStep('input')
  }

  return (
    <div className="min-h-full">
      {step === 'input' && (
        <InputPage
          onSimulationStart={(summary, adCopy) => handleStart(summary, adCopy)}
          onSimulationComplete={handleComplete}
          onError={handleError}
          errorMessage={errorMsg}
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
