import { useEffect, useState } from 'react'
import {
  Brain, Users, BarChart3, Lightbulb, RefreshCw, ShieldCheck,
  Database, Server, Globe, Code2, CheckCircle, ExternalLink,
  Cpu, BookOpen, FlaskConical, Network, ArrowRight, Terminal,
  GitBranch,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

// ─── Static data ──────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  {
    n: '01', icon: Brain, color: 'indigo',
    label: 'Campaign Analyzer',
    tech: 'Multimodal LLM · Image + Text',
    desc: 'Scores ad copy and creative across 6 dimensions (emotional tone, CTA strength, audience fit, trust signals, clarity, emotional appeal) — each rated 0–10 for the radar chart. Accepts image uploads for visual analysis. Dimension weights shift based on funnel stage: Awareness emphasizes emotional resonance, Conversion emphasizes CTA and friction reduction.',
  },
  {
    n: '02', icon: Globe, color: 'sky',
    label: 'Audience Researcher',
    tech: 'DuckDuckGo MCP · Real-time Web Search',
    desc: 'Runs 3 parallel web searches via the DuckDuckGo MCP server (stdio transport, no API key) — platform demographics, consumer psychology, campaign format performance — grounding personas in real 2024-2025 data. Falls back to OpenAI Responses API web_search_preview if MCP is unavailable. Runs in parallel with Stage 1 via asyncio.gather().',
  },
  {
    n: '03', icon: Users, color: 'violet',
    label: 'Persona Generator',
    tech: 'LLM · Dynamic · RAG-grounded',
    desc: '3 campaign-specific synthetic personas built from live audience research. Each is distinct in age, mindset, platform behavior, and purchase motivation. Framed by funnel stage — Awareness personas vary in brand familiarity; Consideration personas are actively evaluating options; Conversion personas face final objections near the purchase decision.',
  },
  {
    n: '04', icon: BarChart3, color: 'emerald',
    label: 'Forecast Engine',
    tech: 'Random Forest ML · ChromaDB RAG · LLM narrative',
    desc: 'Random Forest (1,800-row Kaggle dataset, R²=0.49) predicts CTR from platform + budget tier + campaign type. ROAS uses precomputed per-platform Q10–Q90 percentile bands. Both are injected as hard constraints the LLM must respect verbatim — preventing hallucinated numbers. LLM writes engagement estimate, conversion trend, and confidence narrative. Goal-specific framing: Awareness → reach/CPM, Consideration → CTR/CPL, Conversion → ROAS/CPA.',
  },
  {
    n: '05', icon: Lightbulb, color: 'amber',
    label: 'Recommendation Engine',
    tech: 'ChromaDB RAG · LLM',
    desc: 'RAG (n=3 chunks) retrieves platform-specific creative best practices for all selected channels simultaneously. Produces improved CTA, stronger messaging, audience refinement, and platform strategy — targeted to the exact goal, sub-purpose, and channel mix. Also rewrites the ad copy as the input for Stage 6.',
  },
  {
    n: '06', icon: RefreshCw, color: 'cyan',
    label: 'Re-Simulation',
    tech: 'LLM Copy Rewrite → Stages 1+3+4 rerun',
    desc: 'Uses the optimized copy from Stage 5 and reruns Stages 1, 3, and 4. Re-analysis and re-persona generation run in parallel (asyncio.gather). Produces a side-by-side before/after: score delta, ROAS uplift, and per-persona engagement improvement. The before/after numbers are what judges and judges see first.',
  },
  {
    n: '07', icon: ShieldCheck, color: 'rose',
    label: 'QA Reviewer',
    tech: 'OpenAI Function Calling · Two-Pass Flow',
    desc: 'Independent LLM audit of the full simulation against 7 criteria. Two-pass approach: Pass 1 uses tool_choice="auto" so the model can call verify_campaign_math (ROAS × budget arithmetic, ROI direction check — pure Python, no API). Pass 2 appends tool results and forces json_object for the final verdict. This is required because response_format=json_object and tools cannot be combined in a single OpenAI call.',
  },
]

const WIZARD_PATHS = [
  { goal: 'Awareness', sub: 'New Brand', fields: 'Brand personality (3 words), core message' },
  { goal: 'Awareness', sub: 'Repositioning', fields: 'Current perception, desired perception, reason for shift' },
  { goal: 'Awareness', sub: 'Product Launch', fields: 'Product description, target segment, hook / differentiator' },
  { goal: 'Consideration', sub: 'Lead Generation', fields: 'Lead offer types, post-lead flow, CPL baseline' },
  { goal: 'Consideration', sub: 'Engagement & Education', fields: 'Education gap, existing content, content URL' },
  { goal: 'Consideration', sub: 'Traffic & Intent', fields: 'Destination URL, desired on-site action' },
  { goal: 'Conversion', sub: 'Direct Purchase', fields: 'Product name, price point, target ROAS/CPA, offer types' },
  { goal: 'Conversion', sub: 'Sign-up / Trial / Install', fields: 'Signup type, payment required, CPI baseline' },
  { goal: 'Conversion', sub: 'Flash Sale', fields: 'Promo offer, competitive strength, start/end dates, urgency visibility' },
]

const PLATFORM_BENCHMARKS = [
  { platform: 'Meta (FB+IG)', ctr: '0.90%–2.45%', roas: '2.5x–5.8x', note: 'High creative dependency' },
  { platform: 'TikTok', ctr: '0.84%–1.80%', roas: '2.1x–4.9x', note: 'Hook in first 2 seconds critical' },
  { platform: 'Google Search', ctr: '3.17%–6.05%', roas: '4.0x–8.0x', note: 'Intent-driven; high conversion' },
  { platform: 'LinkedIn', ctr: '0.36%–0.70%', roas: '1.5x–3.5x', note: 'B2B; long sales cycles' },
  { platform: 'YouTube', ctr: '0.33%–0.65%', roas: '2.2x–5.0x', note: 'Awareness > direct conversion' },
  { platform: 'Twitter/X', ctr: '0.45%–0.86%', roas: '1.3x–3.0x', note: 'Trending content amplifies results' },
]

const ARCH_LAYERS = [
  {
    label: 'Frontend', color: 'indigo',
    items: ['React 18 + Vite + TypeScript', 'TailwindCSS v4 + shadcn/ui (Radix)', 'Chart.js radar · SVG sparklines', 'React Router v6 · Protected routes', '7-step campaign wizard (9 purpose forms)', 'History persistence (localStorage)'],
  },
  {
    label: 'Backend', color: 'emerald',
    items: ['FastAPI (async, Pydantic v2)', 'asyncio.gather() orchestrator (Stage parallelism)', 'aiofiles multipart image uploads', 'FastMCP server (3 tools, 5 resources)', 'Python MCP stdio client (DuckDuckGo)', 'ChromaDB lifespan init on startup'],
  },
  {
    label: 'AI & Data', color: 'violet',
    items: ['OpenAI chat (multimodal) + embeddings', 'ChromaDB PersistentClient (cosine HNSW)', 'sklearn Random Forest (CTR model)', 'RAG: 5 docs, ~40 chunks, 500-word/50-overlap', 'DuckDuckGo MCP (web search, no API key)', 'joblib model + encoder serialization'],
  },
]

const MCP_BUILT = {
  name: 'Brand-AId MCP Server',
  framework: 'FastMCP (Python)',
  transport: 'stdio',
  tools: ['simulate_campaign', 'analyze_ad_copy', 'query_benchmarks'],
  resources: ['benchmarks://ctr', 'benchmarks://roas', 'audiences://psychology', 'audiences://platforms', 'audiences://creative'],
}

const MCP_USED = {
  name: 'DuckDuckGo MCP Server',
  package: 'duckduckgo-mcp-server (PyPI)',
  transport: 'stdio (spawned as subprocess)',
  tool: 'search (max_results=5)',
  usage: '3 parallel searches per simulation: platform demographics, consumer psychology, campaign format performance. No API key required. Falls back to OpenAI web_search_preview if MCP is unavailable.',
}

const RAG_DOCS = [
  { name: 'platform_ctr_benchmarks.txt', desc: 'CTR by platform + vertical, sourced from WordStream, First Page Sage (2024-2025)' },
  { name: 'roas_conversion_benchmarks.txt', desc: 'ROAS by industry and platform, CPA ranges — Triple Whale, Databox (2024-2025)' },
  { name: 'audience_psychology.txt', desc: 'Gen Z / Millennial / GenX / Boomer profiles, trust signals, emotional triggers' },
  { name: 'platform_best_practices.txt', desc: 'Creative and targeting guidelines per platform — TikTok for Business, Sprout Social' },
  { name: 'campaign_creative_guidelines.txt', desc: 'Copy effectiveness, CTA frameworks, visual trust signals, emotional tone scoring' },
]

const ML_STATS = [
  { label: 'Training samples', value: '1,800' },
  { label: 'Dataset source', value: 'Kaggle — Global Ads Performance (Google, Meta, TikTok)' },
  { label: 'Features', value: 'Platform · Budget Tier · Campaign Type' },
  { label: 'Platform importance', value: '84%' },
  { label: 'CTR model R²', value: '0.49' },
  { label: 'CTR MAE', value: '0.97%' },
  { label: 'ROAS method', value: 'Per-platform Q10/Q25/Q50/Q75/Q90 percentile bands' },
  { label: 'ROI direction', value: 'Deterministic: ROAS midpoint < 2.0x → Negative, 2.0–4.0x → Neutral, >4.0x → Positive' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  sky:    'bg-sky-500/10 border-sky-500/20 text-sky-400',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  emerald:'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  amber:  'bg-amber-500/10 border-amber-500/20 text-amber-400',
  cyan:   'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  rose:   'bg-rose-500/10 border-rose-500/20 text-rose-400',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
      <span className="h-px flex-1 bg-white/5" />
      {children}
      <span className="h-px flex-1 bg-white/5" />
    </h2>
  )
}

// ─── Live status ──────────────────────────────────────────────────────────────

function LiveStatus() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'down'>('checking')

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(r => r.ok ? setStatus('ok') : setStatus('down'))
      .catch(() => setStatus('down'))
  }, [])

  const dot = status === 'ok'
    ? 'bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.4)]'
    : status === 'down' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
  const label = status === 'ok' ? 'Backend online' : status === 'down' ? 'Backend offline' : 'Checking…'
  const color = status === 'ok' ? 'text-emerald-400' : status === 'down' ? 'text-red-400' : 'text-yellow-400'

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full flex-none ${dot}`} />
      <span className={`text-xs font-medium ${color}`}>{label}</span>
    </div>
  )
}

// ─── Interactive Playground ────────────────────────────────────────────────────

const RAG_SUGGESTIONS = [
  'Meta CTR benchmark 2024',
  'TikTok ROAS conversion rate',
  'Google Search average CTR',
  'LinkedIn B2B ad best practices',
  'email marketing open rate benchmark',
]

function RagPlayground() {
  const [query, setQuery] = useState('Meta CTR benchmark 2024')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/benchmarks/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      setResult(data.context || 'No results returned.')
    } catch {
      setError('Could not reach the backend. Make sure the FastAPI server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="e.g. TikTok ROAS benchmark"
          className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500 transition-colors font-mono"
        />
        <button
          onClick={run}
          disabled={loading || !query.trim()}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors flex-none"
        >
          {loading ? 'Querying…' : 'Run'}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {RAG_SUGGESTIONS.map(s => (
          <button key={s} onClick={() => setQuery(s)}
            className="text-xs px-2.5 py-1 rounded-full bg-white/4 border border-white/8 text-slate-400 hover:text-white hover:border-white/20 transition-colors">
            {s}
          </button>
        ))}
      </div>
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>
      )}
      {result && (
        <div className="bg-black/30 border border-white/8 rounded-xl p-4 text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto">
          {result}
        </div>
      )}
    </div>
  )
}

const ANALYZER_DIMENSIONS = ['emotional_tone', 'cta_strength', 'audience_fit', 'trust_signals', 'clarity', 'emotional_appeal']
const DIM_LABELS: Record<string, string> = {
  emotional_tone: 'Emotional Tone', cta_strength: 'CTA Strength', audience_fit: 'Audience Fit',
  trust_signals: 'Trust Signals', clarity: 'Clarity', emotional_appeal: 'Appeal',
}

type AnalysisResult = { overall_score: number; dimension_scores: Record<string, number> }

function CopyAnalyzerPlayground() {
  const [copy, setCopy] = useState("Discover the skincare routine trusted by 500,000 women. 30-day results or your money back. Shop now →")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    if (!copy.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/analyze/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_copy: copy, platform: 'meta', objective: 'brand awareness' }),
      })
      if (!res.ok) throw new Error('API error')
      setResult(await res.json())
    } catch {
      setError('Could not reach the backend. Make sure the FastAPI server is running.')
    } finally {
      setLoading(false)
    }
  }

  function scoreColor(n: number) {
    if (n >= 7) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    if (n >= 4) return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    return 'text-red-400 bg-red-500/10 border-red-500/20'
  }

  return (
    <div className="space-y-3">
      <textarea
        value={copy}
        onChange={e => setCopy(e.target.value)}
        rows={3}
        placeholder="Paste any ad copy here…"
        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500 transition-colors resize-none font-mono"
      />
      <button
        onClick={run}
        disabled={loading || !copy.trim()}
        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        {loading ? 'Analyzing with AI…' : 'Analyze Copy'}
      </button>
      {error && (
        <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</div>
      )}
      {result && (
        <div className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-white">{result.overall_score}/100</span>
            <span className="text-xs text-slate-500">Overall Campaign Score</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {ANALYZER_DIMENSIONS.map(d => {
              const score = result.dimension_scores?.[d] ?? 0
              return (
                <div key={d} className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-medium ${scoreColor(score)}`}>
                  <span className="truncate mr-1">{DIM_LABELS[d]}</span>
                  <span className="font-bold flex-none">{score}/10</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-14">

      {/* ── Hero ── */}
      <div>
        <div className="flex items-start justify-between gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                Technical Documentation
              </span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">Brand-AId</h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              AI-powered campaign simulation engine. Run your ad through a 7-stage AI pipeline —
              synthetic personas, ML-backed forecasts, and copy rewriting —{' '}
              <em className="text-white not-italic">before you spend a dollar.</em>
            </p>
          </div>
          <div className="flex-none bg-[#0D0D15] border border-white/5 rounded-2xl p-4 text-right">
            <LiveStatus />
            <div className="mt-3 text-[10px] text-slate-600 space-y-1">
              <div>Infinity AI Buildfest 2026</div>
              <div>Team: The Unbranded</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pipeline stages', value: '7' },
            { label: 'Avg latency', value: '<60s' },
            { label: 'ML training rows', value: '1,800' },
            { label: 'RAG documents', value: '5' },
          ].map(s => (
            <div key={s.label} className="bg-[#0D0D15] border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-[11px] text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pipeline ── */}
      <div>
        <SectionTitle>AI Pipeline — 7 Stages</SectionTitle>
        <div className="space-y-3">
          {PIPELINE_STAGES.map((s, i) => {
            const cls = COLOR_MAP[s.color]
            return (
              <div key={s.n} className="bg-[#0D0D15] border border-white/5 rounded-2xl p-5 flex gap-4">
                <div className="flex-none flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${cls}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div className="w-px flex-1 min-h-[12px] bg-white/5" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-bold text-slate-600">{s.n}</span>
                    <span className="text-sm font-bold text-white">{s.label}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{s.tech}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Campaign Wizard Structure ── */}
      <div>
        <SectionTitle>Campaign Wizard — 9 Purpose Paths</SectionTitle>
        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
          The 7-step input wizard branches at Step 2 (Purpose) into 9 contextual sub-forms based on the selected goal.
          Each path collects different <code className="text-indigo-300 font-mono text-xs">purpose_context</code> fields that
          are injected into every AI pipeline stage to sharpen persona framing, metric benchmarks, and recommendations.
        </p>
        <div className="bg-[#0D0D15] border border-white/5 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 text-[10px] font-bold uppercase tracking-widest text-slate-600 px-5 py-3 border-b border-white/5">
            <span>Goal</span><span>Sub-purpose</span><span>Key context fields</span>
          </div>
          {WIZARD_PATHS.map((row, i) => (
            <div key={i} className={`grid grid-cols-3 gap-2 px-5 py-3 text-sm border-b border-white/5 last:border-0 ${
              row.goal === 'Awareness' ? 'hover:bg-indigo-500/5' :
              row.goal === 'Consideration' ? 'hover:bg-violet-500/5' : 'hover:bg-emerald-500/5'
            }`}>
              <span className={`text-xs font-semibold ${
                row.goal === 'Awareness' ? 'text-indigo-400' :
                row.goal === 'Consideration' ? 'text-violet-400' : 'text-emerald-400'
              }`}>{row.goal}</span>
              <span className="text-xs text-white font-medium">{row.sub}</span>
              <span className="text-xs text-slate-500">{row.fields}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Architecture ── */}
      <div>
        <SectionTitle>Architecture</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ARCH_LAYERS.map(layer => {
            const cls = COLOR_MAP[layer.color]
            return (
              <div key={layer.label} className="bg-[#0D0D15] border border-white/5 rounded-2xl p-5">
                <div className={`text-xs font-bold uppercase tracking-widest mb-4 ${cls.split(' ').at(-1)}`}>
                  {layer.label}
                </div>
                <ul className="space-y-2">
                  {layer.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                      <ArrowRight className="w-3 h-3 text-slate-600 flex-none mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Platform Benchmarks ── */}
      <div>
        <SectionTitle>Platform Benchmarks (Knowledge Base Sample)</SectionTitle>
        <p className="text-sm text-slate-400 mb-4">
          These ranges power the RAG retrieval used in Stages 4 and 5. The ML model's per-platform percentile bands are derived from the same data.
        </p>
        <div className="bg-[#0D0D15] border border-white/5 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 px-5 py-3 border-b border-white/5">
            <span>Platform</span><span>CTR range</span><span>ROAS range</span><span>Key note</span>
          </div>
          {PLATFORM_BENCHMARKS.map(row => (
            <div key={row.platform} className="grid grid-cols-4 gap-2 px-5 py-3 text-xs border-b border-white/5 last:border-0 hover:bg-white/2">
              <span className="text-white font-medium">{row.platform}</span>
              <span className="text-emerald-400 font-mono">{row.ctr}</span>
              <span className="text-indigo-400 font-mono">{row.roas}</span>
              <span className="text-slate-500">{row.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── ML Forecast ── */}
      <div>
        <SectionTitle>ML Forecast Layer</SectionTitle>
        <div className="bg-[#0D0D15] border border-white/5 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-none">
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm mb-1">Random Forest CTR Model + ROAS Percentile Bands</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                ML numbers are injected as hard constraints the LLM must reproduce verbatim — preventing hallucinated CTR/ROAS figures.
                ROAS regression had R²≈0 (variance driven by factors outside the feature set), so precomputed per-platform percentile bands
                are used instead. The QA Reviewer's <code className="text-rose-300 font-mono text-xs">verify_campaign_math</code> tool
                deterministically cross-checks the numbers after LLM generation.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ML_STATS.map(s => (
              <div key={s.label} className="bg-white/3 rounded-xl p-3">
                <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                <div className="text-sm font-semibold text-white">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RAG ── */}
      <div>
        <SectionTitle>RAG Knowledge Base</SectionTitle>
        <div className="bg-[#0D0D15] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-none">
              <BookOpen className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">ChromaDB · text-embedding-3-small · cosine similarity</h3>
              <p className="text-xs text-slate-500 mt-0.5">~40 chunks · 500-word segments · 50-word overlap · n=3 results per query</p>
            </div>
          </div>
          <div className="space-y-2 mb-6">
            {RAG_DOCS.map(d => (
              <div key={d.name} className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
                <Database className="w-3.5 h-3.5 text-violet-400 flex-none mt-0.5" />
                <div>
                  <div className="text-xs font-mono text-violet-300 mb-0.5">{d.name}</div>
                  <div className="text-xs text-slate-500">{d.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MCP ── */}
      <div>
        <SectionTitle>MCP Integration</SectionTitle>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[#0D0D15] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Built</div>
                <div className="text-sm font-semibold text-white">{MCP_BUILT.name}</div>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-400 mb-4">
              <div><span className="text-slate-600">Framework:</span> {MCP_BUILT.framework}</div>
              <div><span className="text-slate-600">Transport:</span> {MCP_BUILT.transport}</div>
              <div className="text-slate-500 text-[11px] pt-1">Registered in <code className="text-indigo-300">.claude/settings.json</code> — any MCP client can invoke Brand-AId's simulation engine as a tool.</div>
            </div>
            <div className="mb-3">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Tools (3)</div>
              <div className="flex flex-wrap gap-1.5">
                {MCP_BUILT.tools.map(t => (
                  <span key={t} className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Resources (5)</div>
              <div className="flex flex-wrap gap-1.5">
                {MCP_BUILT.resources.map(r => (
                  <span key={r} className="text-[11px] font-mono px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300">{r}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#0D0D15] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                <Network className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Used</div>
                <div className="text-sm font-semibold text-white">{MCP_USED.name}</div>
              </div>
            </div>
            <div className="space-y-2 text-xs text-slate-400 mb-4">
              <div><span className="text-slate-600">Package:</span> {MCP_USED.package}</div>
              <div><span className="text-slate-600">Transport:</span> {MCP_USED.transport}</div>
              <div><span className="text-slate-600">Tool called:</span> <span className="font-mono text-sky-300">{MCP_USED.tool}</span></div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{MCP_USED.usage}</p>
          </div>
        </div>
      </div>

      {/* ── QA Reviewer ── */}
      <div>
        <SectionTitle>QA Reviewer Agent — Stage 7</SectionTitle>
        <div className="bg-[#0D0D15] border border-white/5 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-none">
              <FlaskConical className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm mb-1">Two-Pass OpenAI Tool Calling Flow</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Independent LLM audit of the full simulation output. OpenAI prohibits combining{' '}
                <code className="text-rose-300 font-mono text-xs">response_format=json_object</code> with{' '}
                <code className="text-rose-300 font-mono text-xs">tools</code> — solved with two passes:{' '}
                Pass 1 uses <code className="text-rose-300 font-mono text-xs">tool_choice="auto"</code> so the model can call{' '}
                <code className="text-rose-300 font-mono text-xs">verify_campaign_math</code> (pure Python — no extra API calls);
                Pass 2 appends the tool result and forces <code className="text-rose-300 font-mono text-xs">json_object</code> for the verdict.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Forecast–persona consistency check',
              'Risk specificity (no generic warnings)',
              'Recommendation–weakness alignment',
              'Persona differentiation (3 distinct archetypes)',
              'Optimized copy quality vs original',
              'Narrative coherence across all stages',
              'Numeric consistency — ROAS × budget math via calculator tool',
            ].map(criterion => (
              <div key={criterion} className="flex items-start gap-2 text-sm text-slate-400">
                <CheckCircle className="w-3.5 h-3.5 text-rose-400 flex-none mt-0.5" />
                {criterion}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Request flow ── */}
      <div>
        <SectionTitle>Request Flow &amp; Parallelization</SectionTitle>
        <div className="bg-[#0D0D15] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-semibold text-white">asyncio.gather() DAG</span>
          </div>
          <div className="space-y-2 text-xs font-mono">
            {[
              { label: 'POST /api/simulate/', note: 'Single request → full simulation', color: 'text-indigo-300' },
              { label: '  ├─ Stage 1: Campaign Analyzer  ┐', note: 'parallel', color: 'text-white' },
              { label: '  └─ Stage 2: Audience Researcher ┘', note: 'asyncio.gather()', color: 'text-sky-300' },
              { label: '       ↓', note: '', color: 'text-slate-600' },
              { label: '  Stage 3: Persona Generator', note: 'uses Stage 1 + 2 outputs', color: 'text-violet-300' },
              { label: '       ↓', note: '', color: 'text-slate-600' },
              { label: '  ├─ Stage 4: Forecast Engine      ┐', note: 'parallel', color: 'text-white' },
              { label: '  └─ Stage 5: Recommendation Engine ┘', note: 'asyncio.gather()', color: 'text-emerald-300' },
              { label: '       ↓', note: '', color: 'text-slate-600' },
              { label: '  ├─ Stage 6a: Re-analysis         ┐', note: 'parallel', color: 'text-white' },
              { label: '  └─ Stage 6b: Re-personas          ┘', note: 'asyncio.gather()', color: 'text-cyan-300' },
              { label: '       ↓', note: '', color: 'text-slate-600' },
              { label: '  Stage 7: QA Reviewer', note: 'two-pass tool calling', color: 'text-rose-300' },
              { label: '       ↓', note: '', color: 'text-slate-600' },
              { label: '  SimulationResult JSON →', note: '~40–55s wall time', color: 'text-white' },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className={row.color}>{row.label}</span>
                {row.note && <span className="text-slate-600 text-[10px]">// {row.note}</span>}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-4">asyncio.gather() on Stages 1+2, 4+5, and 6a+6b reduces wall time ~40% vs sequential execution.</p>
        </div>
      </div>

      {/* ── Live Playground ── */}
      <div>
        <SectionTitle>Live API Playground</SectionTitle>
        <p className="text-sm text-slate-400 mb-5">
          Interact with the Brand-AId backend directly. Both endpoints are live — requires the FastAPI server to be running.
        </p>

        {/* RAG Query */}
        <div className="bg-[#0D0D15] border border-white/5 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-none">
              <Database className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">RAG Knowledge Base Query</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">POST /api/benchmarks/ · ChromaDB vector search</div>
            </div>
          </div>
          <RagPlayground />
        </div>

        {/* Ad Copy Analyzer */}
        <div className="bg-[#0D0D15] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-none">
              <Terminal className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Ad Copy Analyzer — Stage 1</div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">POST /api/analyze/ · Multimodal LLM · returns 6 dimension scores</div>
            </div>
          </div>
          <CopyAnalyzerPlayground />
        </div>
      </div>

      {/* ── Open Source Stack ── */}
      <div>
        <SectionTitle>Open Source Stack</SectionTitle>
        <div className="flex flex-wrap gap-2">
          {[
            'FastAPI', 'React 18', 'Vite', 'TypeScript', 'TailwindCSS v4',
            'shadcn/ui', 'Chart.js', 'ChromaDB', 'scikit-learn', 'pandas',
            'FastMCP', 'mcp (Python)', 'duckduckgo-mcp-server', 'Pydantic v2',
            'httpx', 'joblib', 'aiofiles', 'React Router v6',
          ].map(t => (
            <span key={t} className="flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-white/4 border border-white/8 px-3 py-1.5 rounded-lg">
              <Code2 className="w-3 h-3 text-slate-500" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="pb-8 text-center">
        <p className="text-xs text-slate-600">
          Brand-AId · Infinity AI Buildfest 2026 · Team: The Unbranded ·{' '}
          <a href="https://github.com/alviriseup/brand-AId" target="_blank" rel="noreferrer"
            className="text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1">
            GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      </div>

    </div>
  )
}
