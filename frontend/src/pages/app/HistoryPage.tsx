import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  History, PlusCircle, TrendingUp, TrendingDown, MinusCircle,
  CheckCircle, XCircle, Clock, ChevronUp, Trash2,
} from 'lucide-react'
import { getHistory, clearHistory, type SimulationRecord } from '@/lib/history'
import ResultsPage from '@/pages/ResultsPage'

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  facebook: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  tiktok: 'bg-slate-500/15 text-slate-300 border-slate-500/20',
  google: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  'google ads': 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  youtube: 'bg-red-500/15 text-red-400 border-red-500/20',
  linkedin: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  'twitter/x': 'bg-slate-500/15 text-slate-300 border-slate-500/20',
}
function platformColor(p: string) {
  return PLATFORM_COLORS[p.toLowerCase()] ?? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20'
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d === 1 ? 'yesterday' : `${d}d ago`
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
  return <span className={`text-sm font-bold ${color}`}>{score}</span>
}

function RoiIcon({ roi }: { roi: string }) {
  if (roi === 'Positive') return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
  if (roi === 'Negative') return <TrendingDown className="w-3.5 h-3.5 text-red-400" />
  return <MinusCircle className="w-3.5 h-3.5 text-yellow-400" />
}

function VerdictIcon({ verdict }: { verdict?: string }) {
  if (!verdict) return null
  if (verdict === 'Pass') return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
  if (verdict === 'Needs Improvement') return <XCircle className="w-3.5 h-3.5 text-red-400" />
  return <MinusCircle className="w-3.5 h-3.5 text-yellow-400" />
}

function ExpandedResult({ record, onClose }: { record: SimulationRecord; onClose: () => void }) {
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

export default function HistoryPage() {
  const [history, setHistory] = useState(getHistory)
  const [expanded, setExpanded] = useState<SimulationRecord | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  function handleClear() {
    clearHistory()
    setHistory([])
    setConfirmClear(false)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">History</h1>
          <p className="text-slate-400 text-sm mt-1">
            {history.length} simulation{history.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <div className="flex items-center gap-3">
          {history.length > 0 && (
            confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Clear all history?</span>
                <button onClick={handleClear} className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition-colors">
                  Yes, clear
                </button>
                <button onClick={() => setConfirmClear(false)} className="text-xs bg-white/5 hover:bg-white/10 text-slate-400 px-3 py-1.5 rounded-lg transition-colors">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear history
              </button>
            )
          )}
          <Link
            to="/app/new"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {history.length === 0 ? (
        <div className="bg-[#0D0D15] border border-white/5 rounded-2xl py-20 text-center">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-medium mb-1">No simulations yet</p>
          <p className="text-slate-600 text-sm mb-6">Your past runs will appear here</p>
          <Link
            to="/app/new"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Run your first simulation
          </Link>
        </div>
      ) : (
        <div className="bg-[#0D0D15] border border-white/5 rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-white/5 text-xs text-slate-500 font-medium">
            <span>Campaign</span>
            <span className="hidden sm:block">Score</span>
            <span className="hidden md:block">CTR</span>
            <span className="hidden md:block">ROI</span>
            <span className="hidden lg:block">QA</span>
            <span>When</span>
          </div>

          <div className="divide-y divide-white/5">
            {history.map(record => (
              <button
                key={record.id}
                onClick={() => setExpanded(record)}
                className="w-full grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-4 items-center text-left hover:bg-white/2 transition-colors group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${platformColor(record.platform)}`}>
                      {record.platform}
                    </span>
                    <span className="text-xs text-slate-500 hidden sm:block">{record.objective}</span>
                  </div>
                  <p className="text-sm text-slate-300 truncate group-hover:text-white transition-colors">
                    {record.ad_copy_preview}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <ScoreBadge score={record.overall_score} />
                  <span className="text-slate-600 text-xs">/100</span>
                </div>
                <div className="hidden md:block text-xs text-slate-400 font-mono whitespace-nowrap">
                  {record.ctr_range}
                </div>
                <div className="hidden md:flex items-center">
                  <RoiIcon roi={record.roi_direction} />
                </div>
                <div className="hidden lg:flex items-center">
                  <VerdictIcon verdict={record.qa_verdict} />
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600 whitespace-nowrap">
                  <Clock className="w-3 h-3" />
                  {timeAgo(record.timestamp)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expanded result overlay */}
      {expanded && (
        <ExpandedResult record={expanded} onClose={() => setExpanded(null)} />
      )}
    </div>
  )
}
