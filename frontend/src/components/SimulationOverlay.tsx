import { ChevronUp } from 'lucide-react'
import type { SimulationRecord } from '@/lib/history'
import ResultsPage from '@/pages/ResultsPage'

/**
 * Full-screen overlay that renders a saved simulation's ResultsPage.
 * Shared by the Dashboard and History pages so a saved run opens identically
 * from either place.
 */
export default function SimulationOverlay({
  record,
  onClose,
}: {
  record: SimulationRecord
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#050508]/90 backdrop-blur border-b border-white/5">
          <div className="text-sm text-slate-400">
            Viewing simulation from <span className="text-white">{new Date(record.timestamp).toLocaleDateString()}</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
            Close
          </button>
        </div>
        <ResultsPage
          result={record.result}
          campaignSummary={{ objective: record.objective, platform: record.platform, ad_copy: record.ad_copy_preview }}
          onReset={onClose}
        />
      </div>
    </div>
  )
}
