import { Link } from 'react-router-dom'
import {
  Zap, BarChart3, Users, Brain, ShieldCheck, Plug,
  ArrowRight, ChevronRight, TrendingUp, Target, Sparkles,
} from 'lucide-react'

const PIPELINE_STEPS = [
  { n: '01', label: 'Campaign Analyzer', desc: 'Multimodal AI scores tone, CTA strength, clarity & trust signals from your copy and image.' },
  { n: '02', label: 'Audience Researcher', desc: 'DuckDuckGo MCP runs 3 parallel web searches for real 2024-2025 platform demographic data.' },
  { n: '03', label: 'Persona Generator', desc: '3 campaign-specific synthetic personas built from live web research — not static templates.' },
  { n: '04', label: 'Forecast Engine', desc: 'ML model trained on 1,800 real campaigns anchors CTR and ROAS. RAG injects benchmarks.' },
  { n: '05', label: 'Recommendation Engine', desc: 'RAG-grounded improvements: better CTA, tighter messaging, audience and platform strategy.' },
  { n: '06', label: 'Re-Simulation', desc: 'AI rewrites your copy and runs stages 1–4 again. Side-by-side before/after comparison.' },
  { n: '07', label: 'QA Reviewer', desc: 'Independent LLM audit with a calculator tool catches math errors and inconsistencies.' },
]

const FEATURES = [
  { icon: Zap, label: 'Under 60 Seconds', desc: 'Full 7-stage pipeline runs in a single API call with async parallelization.', color: 'text-yellow-400' },
  { icon: Brain, label: 'Real Audience Intelligence', desc: 'Web-researched personas grounded in actual platform demographics and behavior.', color: 'text-violet-400' },
  { icon: BarChart3, label: 'ML-Backed Forecasts', desc: 'CTR and ROAS predictions anchored by a Random Forest trained on 1,800 real campaigns.', color: 'text-indigo-400' },
  { icon: Users, label: 'Synthetic Persona Simulation', desc: '3 personas react independently — engagement, trust, objections, conversion likelihood.', color: 'text-emerald-400' },
  { icon: ShieldCheck, label: 'QA Reviewer Agent', desc: 'Catches hallucinated numbers and narrative inconsistencies before you see the results.', color: 'text-sky-400' },
  { icon: Plug, label: 'MCP-Native', desc: 'Built on Model Context Protocol. Expose Brand-AId as tools any AI client can call.', color: 'text-pink-400' },
]

const STATS = [
  { value: '7', label: 'AI Pipeline Stages' },
  { value: '60s', label: 'Avg Simulation Time' },
  { value: '1,800', label: 'Campaigns in Training Data' },
  { value: '5', label: 'Knowledge Base Docs' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Brand-AId</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link
              to="/login"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <Zap className="w-3 h-3" />
            AI Campaign Simulation Engine · Built for Infinity AI Buildfest 2026
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            Know Your Campaign<br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Works Before You Launch
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Brand-AId simulates how real audiences react to your ad using a 7-stage AI pipeline.
            Forecast CTR, ROAS, and engagement — before you spend a dollar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-600/25"
            >
              Start Simulating Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              See How It Works
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5 max-w-3xl w-full">
          {STATS.map(s => (
            <div key={s.label} className="bg-[#0D0D15] px-6 py-6 text-center">
              <div className="text-3xl font-bold text-white mb-1">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            $650B is wasted on ads that don't work
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Marketers launch campaigns based on gut feel, wait weeks for results, then iterate.
            By then, budget is gone. Brand-AId brings simulation before spend.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {[
              { icon: Target, label: 'Wrong Targeting', desc: 'Copy written for the wrong persona — the audience it reaches isn\'t the one it was designed for.' },
              { icon: TrendingUp, label: 'No Baseline', desc: 'No CTR or ROAS forecast means no way to know if a campaign is worth running until it\'s too late.' },
              { icon: ShieldCheck, label: 'Zero Iteration', desc: 'A/B testing burns budget. Teams ship version one and hope. There\'s no pre-launch feedback loop.' },
            ].map(c => (
              <div key={c.label} className="bg-[#0D0D15] border border-white/5 rounded-2xl p-6 text-left">
                <c.icon className="w-5 h-5 text-red-400 mb-3" />
                <div className="font-semibold mb-2">{c.label}</div>
                <div className="text-sm text-slate-400 leading-relaxed">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pipeline ────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-medium text-indigo-400 uppercase tracking-widest mb-3">The Pipeline</div>
            <h2 className="text-3xl md:text-4xl font-bold">7 stages. One API call.</h2>
            <p className="text-slate-400 mt-3 max-w-xl mx-auto">
              Every simulation runs the full pipeline end-to-end, with async parallelization cutting wall time by ~40%.
            </p>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-indigo-600/60 via-violet-600/40 to-emerald-600/30 hidden md:block" />
            <div className="space-y-4">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.n} className="flex gap-5 items-start">
                  <div className="flex-none w-14 h-14 rounded-2xl bg-[#0D0D15] border border-white/8 flex flex-col items-center justify-center z-10">
                    <span className="text-[10px] text-slate-600 font-mono">{step.n}</span>
                    <span className="text-xs font-semibold text-indigo-400">{i + 1}</span>
                  </div>
                  <div className="flex-1 bg-[#0D0D15] border border-white/5 rounded-2xl px-5 py-4 hover:border-indigo-500/20 transition-colors">
                    <div className="font-semibold text-sm mb-1">{step.label}</div>
                    <div className="text-sm text-slate-400 leading-relaxed">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-3">Features</div>
            <h2 className="text-3xl md:text-4xl font-bold">Built for real decisions</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(f => (
              <div key={f.label} className="bg-[#0D0D15] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                <f.icon className={`w-5 h-5 ${f.color} mb-4`} />
                <div className="font-semibold mb-2">{f.label}</div>
                <div className="text-sm text-slate-400 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-600/10 rounded-3xl blur-3xl" />
            <div className="relative bg-[#0D0D15] border border-indigo-500/20 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to test your next campaign?
              </h2>
              <p className="text-slate-400 mb-8">
                Sign in and run your first simulation in under 60 seconds.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-indigo-600/30"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="w-5 h-5 rounded bg-indigo-600/80 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            Brand-AId · Infinity AI Buildfest 2026
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
            <Link to="/login" className="hover:text-slate-300 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
