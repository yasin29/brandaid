import { Link } from 'react-router-dom'
import { PlusCircle, TrendingUp, BarChart3, Zap, CheckCircle, XCircle, MinusCircle, ArrowRight, Clock } from 'lucide-react'
import { getHistory } from '@/lib/history'
import { getUser } from '@/lib/auth'

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-500/15 text-pink-400',
  facebook: 'bg-blue-500/15 text-blue-400',
  tiktok: 'bg-slate-500/15 text-slate-300',
  google: 'bg-yellow-500/15 text-yellow-400',
  youtube: 'bg-red-500/15 text-red-400',
  linkedin: 'bg-sky-500/15 text-sky-400',
  twitter: 'bg-slate-500/15 text-slate-300',
}

function platformColor(p: string) {
  return PLATFORM_COLORS[p.toLowerCase()] ?? 'bg-indigo-500/15 text-indigo-400'
}

function roiBadge(roi: string) {
  if (roi === 'Positive') return <span className="flex items-center gap-1 text-emerald-400 text-xs"><TrendingUp className="w-3 h-3" />Positive</span>
  if (roi === 'Negative') return <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-3 h-3" />Negative</span>
  return <span className="flex items-center gap-1 text-yellow-400 text-xs"><MinusCircle className="w-3 h-3" />Neutral</span>
}

function verdictBadge(v?: string) {
  if (!v) return null
  if (v === 'Pass') return <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle className="w-3 h-3" />Pass</span>
  if (v === 'Needs Improvement') return <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle className="w-3 h-3" />Needs Work</span>
  return <span className="flex items-center gap-1 text-yellow-400 text-xs"><MinusCircle className="w-3 h-3" />Partial</span>
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function DashboardPage() {
  const history = getHistory()
  const user = getUser()
  const recent = history.slice(0, 5)

  const avgScore = history.length
    ? Math.round(history.reduce((s, r) => s + r.overall_score, 0) / history.length)
    : 0

  const platforms = history.reduce<Record<string, number>>((acc, r) => {
    acc[r.platform] = (acc[r.platform] ?? 0) + 1
    return acc
  }, {})
  const topPlatform = Object.entries(platforms).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const passCount = history.filter(r => r.qa_verdict === 'Pass').length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, <span className="text-white">{user?.email.split('@')[0]}</span>
          </p>
        </div>
        <Link
          to="/app/new"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Simulations', value: history.length.toString(), icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { label: 'Avg Campaign Score', value: history.length ? `${avgScore}/100` : '—', icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Top Platform', value: topPlatform.charAt(0).toUpperCase() + topPlatform.slice(1), icon: TrendingUp, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'QA Pass Rate', value: history.length ? `${Math.round((passCount / history.length) * 100)}%` : '—', icon: CheckCircle, color: 'text-sky-400', bg: 'bg-sky-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-[#0D0D15] border border-white/5 rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Simulations */}
      <div className="bg-[#0D0D15] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/5">
          <div>
            <h2 className="font-semibold text-sm">Recent Simulations</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your last {recent.length} runs</p>
          </div>
          {history.length > 5 && (
            <Link to="/app/history" className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Zap className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No simulations yet</p>
            <p className="text-slate-600 text-xs mt-1 mb-6">Run your first campaign to see results here</p>
            <Link
              to="/app/new"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              <PlusCircle className="w-4 h-4" /> New Campaign
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recent.map(r => (
              <div key={r.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${platformColor(r.platform)}`}>
                      {r.platform}
                    </span>
                    <span className="text-xs text-slate-500">{r.objective}</span>
                  </div>
                  <p className="text-sm text-slate-300 truncate">{r.ad_copy_preview}</p>
                </div>
                <div className="flex items-center gap-6 flex-none text-right">
                  <div className="hidden sm:block">
                    <div className="text-sm font-semibold text-white">{r.overall_score}/100</div>
                    <div className="text-xs text-slate-500">score</div>
                  </div>
                  <div className="hidden md:block">{roiBadge(r.roi_direction)}</div>
                  <div className="hidden lg:block">{verdictBadge(r.qa_verdict)}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock className="w-3 h-3" />
                    {timeAgo(r.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platform breakdown */}
      {history.length > 0 && (
        <div className="mt-4 bg-[#0D0D15] border border-white/5 rounded-2xl p-6">
          <h2 className="font-semibold text-sm mb-5">Simulations by Platform</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(platforms).sort((a, b) => b[1] - a[1]).map(([p, count]) => (
              <div key={p} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${platformColor(p)}`}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
                <span className="opacity-60">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
