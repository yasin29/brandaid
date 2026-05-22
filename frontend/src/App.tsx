import { useState } from 'react'
import type { SimulationResult } from '@/types'
import InputPage from '@/pages/InputPage'
import ProcessingPage from '@/pages/ProcessingPage'
import ResultsPage from '@/pages/ResultsPage'

type Screen = 'input' | 'processing' | 'results'

export default function App() {
  const [screen, setScreen] = useState<Screen>('input')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="dark">
      {screen === 'input' && (
        <InputPage
          onSimulationStart={() => {
            setError(null)
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
          onReset={() => {
            setResult(null)
            setScreen('input')
          }}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-destructive text-white px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
