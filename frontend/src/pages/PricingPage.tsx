import { Link } from 'react-router-dom'
import { Check, Sparkles, ArrowRight, Zap } from 'lucide-react'

const PLANS = [
  {
    name: 'Starter',
    price: 'Free',
    sub: 'forever',
    description: 'Try Brand-AId with no commitment.',
    cta: 'Get started',
    ctaLink: '/login',
    highlight: false,
    features: [
      '3 simulations / month',
      'Campaign analysis (Stage 1)',
      'Basic persona generation',
      'CTR forecast range',
      'Email support',
    ],
    missing: [
      'Full 7-stage pipeline',
      'Re-simulation & before/after',
      'QA Reviewer agent',
      'Simulation history',
      'MCP API access',
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    sub: 'per month',
    description: 'Full pipeline for serious marketers.',
    cta: 'Start free trial',
    ctaLink: '/login',
    highlight: true,
    features: [
      'Unlimited simulations',
      'Full 7-stage AI pipeline',
      'Re-simulation & before/after',
      'QA Reviewer agent',
      'Simulation history (up to 100)',
      'Priority processing',
      'RAG benchmark data',
      'ML-anchored CTR & ROAS',
      'Email + chat support',
    ],
    missing: [
      'White-label',
      'Team seats',
      'SLA guarantee',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    sub: 'contact us',
    description: 'For agencies and marketing teams.',
    cta: 'Talk to us',
    ctaLink: '/login',
    highlight: false,
    features: [
      'Everything in Pro',
      'Unlimited history',
      'MCP API access',
      'White-label options',
      'Team seats & roles',
      'SSO / SAML',
      '99.9% uptime SLA',
      'Dedicated support',
      'Custom integrations',
    ],
    missing: [],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white">

      {/* Nav */}
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Brand-AId</span>
        </Link>
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
      </nav>

      {/* Header */}
      <section className="pt-20 pb-16 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap className="w-3 h-3" />
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Start free. Scale when ready.
          </h1>
          <p className="text-slate-400 text-lg">
            No credit card required to get started. Upgrade when you need more simulations.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4 items-start">
          {PLANS.map(plan => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 border transition-all ${
                plan.highlight
                  ? 'bg-indigo-600/8 border-indigo-500/30 shadow-xl shadow-indigo-600/10'
                  : 'bg-[#0D0D15] border-white/5'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <div className="text-sm font-medium text-slate-400 mb-2">{plan.name}</div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm pb-1">{plan.sub}</span>
                </div>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>

              <Link
                to={plan.ctaLink}
                className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold mb-7 transition-all ${
                  plan.highlight
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <div className="space-y-2.5">
                {plan.features.map(f => (
                  <div key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-emerald-400 flex-none mt-0.5" />
                    <span className="text-slate-300">{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} className="flex items-start gap-2.5 text-sm opacity-30">
                    <div className="w-4 h-4 flex-none mt-0.5 flex items-center justify-center">
                      <div className="w-3 h-px bg-slate-600" />
                    </div>
                    <span className="text-slate-500">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Common questions</h2>
          <div className="space-y-4">
            {[
              { q: 'What counts as a simulation?', a: 'One simulation = one full pipeline run. Submitting a campaign and getting back all 7 stages of analysis counts as one.' },
              { q: 'Is the free tier really free?', a: 'Yes — no credit card required, no trial period. You get 3 simulations per month on the free tier indefinitely.' },
              { q: 'What is the MCP API access on Enterprise?', a: 'Brand-AId exposes a FastMCP server. Enterprise customers get API credentials to call simulate_campaign, analyze_ad_copy, and query_benchmarks from any MCP client.' },
              { q: 'Can I upgrade or cancel anytime?', a: 'Yes. Upgrade, downgrade, or cancel from your account settings at any time. No long-term commitments.' },
            ].map(item => (
              <div key={item.q} className="bg-[#0D0D15] border border-white/5 rounded-xl px-6 py-5">
                <div className="font-medium text-sm mb-2">{item.q}</div>
                <div className="text-sm text-slate-400 leading-relaxed">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6 text-center text-xs text-slate-600">
        <Link to="/" className="hover:text-slate-400 transition-colors">← Back to home</Link>
        <span className="mx-3">·</span>
        Brand-AId · Build by Yasin Billah
      </footer>
    </div>
  )
}
