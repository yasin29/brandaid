import { useState } from 'react'
import type { SimulationResult } from '@/types'
import InputPage from '@/pages/InputPage'
import ProcessingPage from '@/pages/ProcessingPage'
import ResultsPage from '@/pages/ResultsPage'

type Screen = 'input' | 'processing' | 'results'
type CampaignSummary = { objective: string; platform: string }

export default function App() {
  const [screen, setScreen] = useState<Screen>('input')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [summary, setSummary] = useState<CampaignSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <>
      {screen === 'input' && (
        <InputPage
          onSimulationStart={(s) => {
            setError(null)
            setSummary(s)
            setScreen('processing')
          }}
          onSimulationComplete={r => {
            setResult(r)
            setScreen('results')
          }}
          onError={e => {
            setError(e)
            setScreen('input')
          }}
        />
      )}

      {screen === 'processing' && <ProcessingPage />}

      {screen === 'results' && result && (
        <ResultsPage
          result={result}
          campaignSummary={summary}
          onReset={() => {
            setResult(null)
            setSummary(null)
            setScreen('input')
          }}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg">
          {error}
        </div>
      )}
    </>
  )
}
