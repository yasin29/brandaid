import { useEffect, useState } from 'react'
import {
  Zap, Brain, Users, BarChart3, Lightbulb, RefreshCw, ShieldCheck,
  Database, Server, Globe, Code2, CheckCircle, ExternalLink,
  Cpu, BookOpen, FlaskConical, Network, ArrowRight,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

// ─── Data ─────────────────────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  {
    n: '01', icon: Brain, color: 'indigo',
    label: 'Campaign Analyzer',
    tech: 'Multimodal LLM · Image + Text',
    desc: 'Scores ad copy and creative across 6 dimensions (emotional tone, CTA strength, audience fit, trust signals, clarity, emotional appeal) — each rated 0–10 for the radar chart. Accepts image uploads for visual analysis.',
  },
  {
    n: '02', icon: Globe, color: 'sky',
    label: 'Audience Researcher',
    tech: 'MCP Web Search · Real-time Data',
    desc: 'Runs 3 parallel web searches via DuckDuckGo MCP server — platform demographics, consumer psychology, campaign format performance — to ground personas in current 2024-2025 data. Falls back to OpenAI Responses API web_search_preview.',
  },
  {
    n: '03', icon: Users, color: 'violet',
    label: 'Persona Generator',
    tech: 'LLM · Dynamic Generation',
    desc: '3 campaign-specific synthetic personas built from live audience research. Each persona is distinct across age, mindset, platform behavior, and purchase motivation — framed by funnel stage (Awareness / Consideration / Conversion).',
  },
  {
    n: '04', icon: BarChart3, color: 'emerald',
    label: 'Forecast Engine',
    tech: 'Random Forest ML · RAG · LLM',
    desc: 'ML model (trained on 1,800-row Kaggle ad dataset) anchors CTR/ROAS as hard constraints. RAG retrieves 2024-2025 benchmark data from ChromaDB. LLM writes engagement estimate, conversion trend, and confidence narrative consistent with the ML numbers.',
  },
  {
    n: '05', icon: Lightbulb, color: 'amber',
    label: 'Recommendation Engine',
    tech: 'RAG · LLM',
    desc: 'RAG retrieves platform-specific creative best practices across all selected channels. Produces improved CTA, stronger messaging, audience refinement, and platform strategy — targeted to the exact funnel stage and sub-purpose.',
  },
  {
    n: '06', icon: RefreshCw, color: 'cyan',
    label: 'Re-Simulation',
    tech: 'LLM Copy Rewrite + Stages 1–4',
    desc: 'AI rewrites the ad copy applying all recommendations, then reruns Stages 1–4 on the optimized version. Produces a side-by-side before/after comparison with score delta and ROAS uplift. Runs in parallel: re-analysis + re-personas simultaneously.',
  },
  {
    n: '07', icon: ShieldCheck, color: 'rose',
    label: 'QA Reviewer',
    tech: 'OpenAI Function Calling · Two-Pass',
    desc: 'Independent LLM audit of the full simulation output against 7 criteria. Uses OpenAI function calling (verify_campaign_math) for deterministic arithmetic checks — catches ROAS×budget contradictions and ROI direction mismatches. Verdict: Pass / Partial Pass / Needs Improvement.',
  },
]

const ARCH_LAYERS = [
  {
    label: 'Frontend',
    color: 'indigo',
    items: ['React 18 + Vite', 'TypeScript', 'TailwindCSS v4', 'shadcn/ui (Radix)', 'Chart.js radar', 'React Router v6'],
  },
  {
    label: 'Backend',
    color: 'emerald',
    items: ['FastAPI (async)', 'Pydantic v2', 'asyncio.gather() orchestrator', 'aiofiles image uploads', 'FastMCP server', 'Python MCP client'],
  },
  {
    label: 'AI & Data',
    color: 'violet',
    items: ['OpenAI (chat + embeddings)', 'ChromaDB (local vector store)', 'sklearn Random Forest', 'DuckDuckGo MCP (web search)', 'RAG knowledge base (5 docs)', 'joblib model serialization'],
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
  transport: 'stdio (subprocess)',
  tool: 'search (max_results=5)',
  usage: '3 parallel searches per simulation — platform demographics, consumer psychology, campaign format performance.',
}

const RAG_DOCS = [
  { name: 'platform_ctr_benchmarks.txt', desc: 'CTR by platform, 2024-2025 (WordStream, First Page Sage)' },
  { name: 'roas_conversion_benchmarks.txt', desc: 'ROAS by industry/platform, CPA rates (Triple Whale, Databox)' },
  { name: 'audience_psychology.txt', desc: 'Gen Z / Millennial / GenX / Boomer profiles, trust signals' },
  { name: 'platform_best_practices.txt', desc: 'Creative + targeting best practices per platform' },
  { name: 'campaign_creative_guidelines.txt', desc: 'Copy effectiveness, emotional tone, CTA frameworks' },
]

const ML_STATS = [
  { label: 'Training samples', value: '1,800' },
  { label: 'Features', value: 'Platform, Budget Tier, Campaign Type' },
  { label: 'CTR model R²', value: '0.49' },
  { label: 'CTR MAE', value: '0.97%' },
  { label: 'Platform importance', value: '84%' },
  { label: 'ROAS method', value: 'Q10–Q90 percentile bands' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  sky: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
      <span className="h-px flex-1 bg-white/5" />
      {children}
      <span className="h-px flex-1 bg-white/5" />
    </h2>
  )
}

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

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full flex-none ${dot}`} />
      <span className={`text-xs font-medium ${status === 'ok' ? 'text-emerald-400' : status === 'down' ? 'text-red-400' : 'text-yellow-400'}`}>
        {label}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-14">

      {/* ── Hero ── */}
      <div>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                Technical Documentation
              </span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight mb-3">Brand-AId</h1>
            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
              AI-powered campaign simulation engine. Run your ad through a 7-stage AI pipeline —
              synthetic personas, ML-backed forecasts, and copy rewriting — <em className="text-white not-italic">before you spend a dollar.</em>
            </p>
          </div>
          <div className="flex-none bg-[#0D0D15] border border-white/5 rounded-2xl p-4 text-right min-w-[160px]">
            <LiveStatus />
            <div className="mt-3 text-[10px] text-slate-600 space-y-1">
              <div>FastAPI · Port 8000</div>
              <div>React · Port 5173</div>
            </div>
          </div>
        </div>

        {/* Key stats */}
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
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-300">
                      <ArrowRight className="w-3 h-3 text-slate-600 flex-none" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
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
              <h3 className="font-semibold text-white text-sm mb-1">Random Forest CTR Model</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Trained on the Kaggle "Global Ads Performance (Google, Meta, TikTok)" dataset.
                ML-predicted CTR and ROAS ranges are injected as hard constraints the LLM must use verbatim —
                preventing hallucinated numbers. ROAS uses precomputed per-platform percentile bands
                (Q10–Q90) since regression R²≈0 for ROAS variance.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
              <p className="text-xs text-slate-500 mt-0.5">~40 chunks · 500-word segments · 50-word overlap</p>
            </div>
          </div>
          <div className="space-y-2">
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
          {/* Built */}
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

          {/* Used */}
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
              <h3 className="font-semibold text-white text-sm mb-1">Two-Pass Tool Calling Flow</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Independent LLM audit of the full simulation output. Cannot use{' '}
                <code className="text-rose-300 font-mono text-xs">response_format=json_object</code> and{' '}
                <code className="text-rose-300 font-mono text-xs">tools</code> simultaneously (OpenAI constraint) —
                solved with a two-pass approach: Pass 1 allows <code className="text-rose-300 font-mono text-xs">tool_choice="auto"</code>{' '}
                for the calculator tool; Pass 2 appends tool results and forces JSON output for the final verdict.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              'Forecast–persona consistency',
              'Risk specificity (not generic warnings)',
              'Recommendation–weakness alignment',
              'Persona differentiation (3 distinct archetypes)',
              'Optimized copy quality vs original',
              'Narrative coherence across stages',
              'Numeric consistency (ROAS × budget math via calculator tool)',
            ].map(criterion => (
              <div key={criterion} className="flex items-start gap-2 text-sm text-slate-400">
                <CheckCircle className="w-3.5 h-3.5 text-rose-400 flex-none mt-0.5" />
                {criterion}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Data flow ── */}
      <div>
        <SectionTitle>Request Flow</SectionTitle>
        <div className="bg-[#0D0D15] border border-white/5 rounded-2xl p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            {[
              { label: 'POST /api/simulate/', color: 'text-indigo-300' },
              { label: '→' },
              { label: 'Orchestrator', color: 'text-white' },
              { label: '→' },
              { label: 'Stage 1 + Research (parallel)', color: 'text-sky-300' },
              { label: '→' },
              { label: 'Stage 3', color: 'text-violet-300' },
              { label: '→' },
              { label: 'Stages 4+5 (parallel)', color: 'text-emerald-300' },
              { label: '→' },
              { label: 'Stage 6 re-sim (6a+6b parallel)', color: 'text-cyan-300' },
              { label: '→' },
              { label: 'Stage 7 QA', color: 'text-rose-300' },
              { label: '→' },
              { label: 'SimulationResult JSON', color: 'text-white' },
            ].map((item, i) => (
              <span key={i} className={item.color ?? 'text-slate-600'}>{item.label}</span>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-4">
            asyncio.gather() parallelization reduces wall time ~40% vs sequential.
            Stages 1+2, 4+5, and 6a+6b run concurrently.
          </p>
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
