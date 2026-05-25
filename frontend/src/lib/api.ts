import type { CampaignInput, SimulationResult } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

export async function runSimulation(input: CampaignInput): Promise<SimulationResult> {
  const form = new FormData()

  // New structured fields
  form.append('goal', input.goal)
  form.append('sub_purpose', input.sub_purpose)
  form.append('purpose_context', JSON.stringify(input.purpose_context))
  form.append('channels', JSON.stringify(input.channels))
  form.append('target_audience', input.target_audience)
  form.append('budget', input.budget)
  form.append('ad_copy', input.ad_copy)

  // Derived backward-compat fields (AI services still read these)
  form.append('objective', input.objective ?? goalToObjective(input.goal, input.sub_purpose))
  form.append('platform', input.platform ?? input.channels[0] ?? input.goal)

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

function goalToObjective(goal: string, subPurpose: string): string {
  const map: Record<string, string> = {
    'new-brand':             'Build brand awareness for a new brand',
    'repositioning':         'Reposition brand perception in the market',
    'product-launch':        'Drive awareness for a new product launch',
    'lead-generation':       'Generate qualified leads for the business',
    'engagement-education':  'Drive engagement and educate the target audience',
    'traffic-intent':        'Drive high-intent traffic to website',
    'direct-purchase':       'Drive direct product purchases',
    'signup-trial':          'Drive sign-ups or free trial activations',
    'flash-sale':            'Maximize conversions during a time-limited promotion',
  }
  return map[subPurpose] ?? `${goal} campaign`
}
