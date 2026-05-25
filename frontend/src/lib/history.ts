import type { SimulationResult } from '@/types'

const HISTORY_KEY = 'brand_aid_history'
const MAX_ENTRIES = 20

export interface SimulationRecord {
  id: string
  timestamp: string
  platform: string
  objective: string
  ad_copy_preview: string
  overall_score: number
  roi_direction: string
  ctr_range: string
  qa_verdict?: string
  result: SimulationResult
}

export function saveSimulation(
  result: SimulationResult,
  meta: { platform: string; objective: string; ad_copy: string },
): SimulationRecord {
  const record: SimulationRecord = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    platform: meta.platform,
    objective: meta.objective,
    ad_copy_preview: meta.ad_copy.slice(0, 100),
    overall_score: result.campaign_analysis.overall_score,
    roi_direction: result.forecast.roi_direction,
    ctr_range: result.forecast.ctr_range,
    qa_verdict: result.qa_review?.verdict,
    result,
  }
  const existing = getHistory()
  const updated = [record, ...existing].slice(0, MAX_ENTRIES)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  return record
}

export function getHistory(): SimulationRecord[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY)
}
