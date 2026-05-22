import type { CampaignInput, SimulationResult } from '@/types'

const API_BASE = 'http://localhost:8000'

export async function runSimulation(input: CampaignInput): Promise<SimulationResult> {
  const form = new FormData()
  form.append('objective', input.objective)
  form.append('platform', input.platform)
  form.append('target_audience', input.target_audience)
  form.append('budget', input.budget)
  form.append('ad_copy', input.ad_copy)
  if (input.image) {
    form.append('image', input.image)
  }

  const res = await fetch(`${API_BASE}/api/simulate/`, {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error || 'Simulation failed')
  }

  return res.json()
}
