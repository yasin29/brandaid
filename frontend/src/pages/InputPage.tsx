import { useState } from 'react'
import type { CampaignInput } from '@/types'
import { runSimulation } from '@/lib/api'
import type { SimulationResult } from '@/types'

interface Props {
  onSimulationStart: () => void
  onSimulationComplete: (result: SimulationResult) => void
  onError: (error: string) => void
}

export default function InputPage({ onSimulationStart, onSimulationComplete, onError }: Props) {
  const [form, setForm] = useState<CampaignInput>({
    objective: '',
    platform: '',
    target_audience: '',
    budget: '',
    ad_copy: '',
  })
  const [image, setImage] = useState<File | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onSimulationStart()
    try {
      const result = await runSimulation({ ...form, image })
      onSimulationComplete(result)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-4xl font-bold mb-2 text-foreground">Brand-AId</h1>
        <p className="text-muted-foreground mb-8">Test your campaign against a synthetic market before launch.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TODO: replace with polished UI components */}
          <input
            placeholder="Campaign Objective"
            value={form.objective}
            onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}
            required
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground"
          />
          <input
            placeholder="Platform (e.g. Instagram, LinkedIn)"
            value={form.platform}
            onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
            required
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground"
          />
          <input
            placeholder="Target Audience"
            value={form.target_audience}
            onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
            required
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground"
          />
          <input
            placeholder="Budget (e.g. $500/month)"
            value={form.budget}
            onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
            required
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground"
          />
          <textarea
            placeholder="Ad Copy"
            value={form.ad_copy}
            onChange={e => setForm(f => ({ ...f, ad_copy: e.target.value }))}
            required
            rows={4}
            className="w-full p-3 rounded-lg border border-border bg-card text-foreground resize-none"
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setImage(e.target.files?.[0])}
            className="w-full text-muted-foreground"
          />
          <button
            type="submit"
            className="w-full p-4 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Run Simulation
          </button>
        </form>
      </div>
    </div>
  )
}
