import { useState } from 'react'
import type { CampaignInput, PurposeContext } from '@/types'
import { runSimulation } from '@/lib/api'
import type { SimulationResult } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7

const CHANNELS = [
  { id: 'meta',           label: 'Meta (FB+IG)',    color: '#1877F2' },
  { id: 'tiktok',         label: 'TikTok',          color: '#0F172A' },
  { id: 'youtube',        label: 'YouTube',         color: '#FF0000' },
  { id: 'linkedin',       label: 'LinkedIn',        color: '#0A66C2' },
  { id: 'google_search',  label: 'Google Search',   color: '#4285F4' },
  { id: 'google_display', label: 'Google Display',  color: '#34A853' },
  { id: 'email',          label: 'Email',           color: '#4338CA' },
  { id: 'whatsapp',       label: 'WhatsApp',        color: '#25D366' },
  { id: 'sms',            label: 'SMS',             color: '#64748B' },
  { id: 'influencer',     label: 'Influencer',      color: '#F59E0B' },
  { id: 'retargeting',    label: 'Retargeting',     color: '#8B5CF6' },
  { id: 'content_seo',    label: 'Content / SEO',   color: '#06B6D4' },
]

const BUDGET_PRESETS = [500, 1000, 5000, 10000, 50000, 100000]
const SLIDER_MIN = 0
const SLIDER_MAX = 1000000

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtBudget(v: number) {
  if (v >= 1000000) return `$${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)}M`
  if (v >= 1000) return `$${Math.round(v / 1000)}K`
  return `$${v}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => {
        const n = i + 1
        const done = n < step
        const active = n === step
        return (
          <div key={n} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${done ? 'bg-indigo-700 text-white' : active ? 'bg-indigo-700 text-white ring-4 ring-indigo-200' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
              {done ? '✓' : n}
            </div>
            {n < TOTAL_STEPS && (
              <div className={`h-0.5 w-6 rounded ${n < step ? 'bg-indigo-700' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

const STEP_LABELS = ['Goal', 'Purpose', 'Channels', 'Creative', 'Audience', 'Budget', 'Review']

function StepLabel({ step }: { step: number }) {
  return (
    <p className="text-center text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-6">
      Step {step} of {TOTAL_STEPS} · {STEP_LABELS[step - 1]}
    </p>
  )
}

// ─── Step 1: Goal ─────────────────────────────────────────────────────────────

const GOALS = [
  {
    id: 'awareness',
    label: 'Awareness',
    sub: 'Top of funnel · Get noticed',
    desc: 'Your audience doesn\'t know you well yet. Build reach, recognition, and memory with the right people.',
    predicts: ['Estimated reach', 'Brand recall lift', 'CPM range'],
    color: '#4338CA',
    pct: '100% of audience',
  },
  {
    id: 'consideration',
    label: 'Consideration',
    sub: 'Mid funnel · Build interest',
    desc: 'They know you — but haven\'t decided yet. Build trust, earn attention, and pull them toward a decision.',
    predicts: ['Click-through rate', 'Cost per lead', 'Engagement rate'],
    color: '#0E7490',
    pct: '~40% of audience',
  },
  {
    id: 'conversion',
    label: 'Conversion',
    sub: 'Bottom funnel · Drive action',
    desc: 'Your audience is ready to act. Every element must work together to cross the finish line.',
    predicts: ['Predicted ROAS', 'Revenue estimate', 'Cost per conversion'],
    color: '#06B6D4',
    pct: '~10% of audience',
  },
]

function GoalStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">What's the goal of this campaign?</h1>
      <p className="text-slate-500 text-sm mb-8">Your goal shapes everything — channels, creative, budget strategy, and what we predict.</p>
      <div className="grid grid-cols-1 gap-4">
        {GOALS.map(g => (
          <button
            key={g.id}
            type="button"
            onClick={() => onChange(g.id)}
            className={`text-left p-5 rounded-2xl border-2 transition-all duration-200
              ${value === g.id
                ? 'border-indigo-600 bg-indigo-50 shadow-[0_0_0_4px_rgba(67,56,202,0.08)]'
                : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-base text-slate-900">{g.label}</span>
                  <span className="text-xs text-slate-400 font-medium">{g.sub}</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{g.desc}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {g.predicts.map(p => (
                    <span key={p} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{p}</span>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-xs font-semibold text-slate-400">{g.pct}</div>
                {value === g.id && (
                  <div className="mt-2 w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center ml-auto">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2: Purpose ─────────────────────────────────────────────────────────

const PURPOSE_OPTIONS: Record<string, Array<{ id: string; label: string; desc: string; when: string }>> = {
  awareness: [
    { id: 'new-brand',      label: 'New brand',      desc: 'We\'re new — most people haven\'t heard of us yet.',                when: 'First major campaign, startup launch, or breaking out of obscurity' },
    { id: 'repositioning',  label: 'Repositioning',  desc: 'People know us, but we want them to see us differently.',           when: 'Brand refresh, audience shift, evolved offering, or reputation reset' },
    { id: 'product-launch', label: 'Product launch', desc: 'Our brand is known — we have a new product to introduce.',          when: 'New product, feature drop, or collection within an established brand' },
  ],
  consideration: [
    { id: 'lead-generation',       label: 'Lead generation',        desc: 'People raise their hand — fill a form, request a demo, download something.',   when: 'B2B, SaaS, high-ticket, services with a sales follow-up' },
    { id: 'engagement-education',  label: 'Engagement & education', desc: 'People engage with your content — read, watch, interact, follow.',               when: 'Brand building, long-cycle products, new or unfamiliar category' },
    { id: 'traffic-intent',        label: 'Traffic & intent',       desc: 'Qualified people land on your site and actually explore.',                        when: 'E-commerce, content-heavy brands, comparison-stage buyers' },
  ],
  conversion: [
    { id: 'direct-purchase', label: 'Direct purchase',         desc: 'People buy your product or service right now.',                      when: 'E-commerce, retail, direct-to-consumer' },
    { id: 'signup-trial',    label: 'Sign-up · Trial · Install', desc: 'People create an account, start a free trial, or download the app.', when: 'SaaS, apps, subscription services' },
    { id: 'flash-sale',      label: 'Promotional · Flash sale', desc: 'A time-limited offer — maximise conversions within a window.',        when: 'Eid push, seasonal sales, flash deals' },
  ],
}

// Purpose sub-forms

function QCard({ n, title, hint, children }: { n: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-4">
      <div className="text-3xl font-black text-indigo-100 leading-none mb-1">{n}</div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      {hint && <p className="text-xs text-slate-500 mb-4 leading-relaxed">{hint}</p>}
      {children}
    </div>
  )
}

function RadioCard({ label, sub, selected, onClick }: { label: string; sub?: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`text-left p-4 rounded-xl border-2 transition-all duration-150
        ${selected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-white'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
          ${selected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          {sub && <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{sub}</div>}
        </div>
      </div>
    </button>
  )
}

function ChipSelect({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-150
        ${selected ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold' : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300'}`}
    >
      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] font-bold
        ${selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
        {selected ? '✓' : ''}
      </span>
      {label}
    </button>
  )
}

function TA({ id, value, onChange, placeholder, minH = 'min-h-[100px]' }:
  { id: string; value: string; onChange: (v: string) => void; placeholder: string; minH?: string }) {
  return (
    <textarea id={id} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full ${minH} bg-[#FAFAFE] border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-y leading-relaxed`}
    />
  )
}

function TI({ id, value, onChange, placeholder, type = 'text' }:
  { id: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#FAFAFE] border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
    />
  )
}

// ── Awareness forms ──

function NewBrandForm({ ctx, set }: { ctx: PurposeContext; set: (k: keyof PurposeContext, v: unknown) => void }) {
  const words = ctx.brandPersonality ?? ['', '', '']
  const setWord = (i: number, v: string) => {
    const next = [...words]; next[i] = v
    set('brandPersonality', next)
  }
  return (
    <>
      <QCard n="01" title="Describe your brand's personality in 3 words." hint="Think emotional, not descriptive. We use this to score your creative for tonal fit.">
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[0, 1, 2].map(i => (
            <input key={i} type="text" maxLength={20}
              value={words[i]} onChange={e => setWord(i, e.target.value)}
              placeholder={['warm', 'premium', 'ethical'][i]}
              className="w-full min-w-0 bg-[#FAFAFE] border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-center font-semibold"
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {['bold', 'minimal', 'authentic', 'playful', 'trustworthy', 'innovative', 'approachable', 'luxurious'].map(w => (
            <button key={w} type="button" onClick={() => {
              const idx = words.findIndex(x => !x.trim())
              if (idx !== -1) setWord(idx, w)
            }}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-all font-medium"
            >{w}</button>
          ))}
        </div>
      </QCard>
      <QCard n="02" title="What's the one thing you most want people to remember after seeing your campaign?" hint="One sentence. The anchor that everything else supports.">
        <TA id="coreMessage" value={ctx.coreMessage ?? ''} onChange={v => set('coreMessage', v)}
          placeholder="e.g., We make luxury skincare feel like everyday self-care." />
      </QCard>
    </>
  )
}

function RepositioningForm({ ctx, set }: { ctx: PurposeContext; set: (k: keyof PurposeContext, v: unknown) => void }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 mb-3">Today</span>
          <p className="text-sm font-semibold text-slate-800 mb-1">How do people see your brand now?</p>
          <p className="text-xs text-slate-500 mb-3">Be honest. This is the perception you're trying to shift.</p>
          <TA id="currentPerception" value={ctx.currentPerception ?? ''} onChange={v => set('currentPerception', v)}
            placeholder="e.g., We're seen as the cheap, basic option in the category." minH="min-h-[110px]" />
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 mb-3">Tomorrow</span>
          <p className="text-sm font-semibold text-slate-800 mb-1">How do you want them to see you?</p>
          <p className="text-xs text-slate-500 mb-3">The destination of your repositioning.</p>
          <TA id="desiredPerception" value={ctx.desiredPerception ?? ''} onChange={v => set('desiredPerception', v)}
            placeholder="e.g., We're the premium, ethically-made choice for design-conscious people." minH="min-h-[110px]" />
        </div>
      </div>
      <QCard n="03" title="Why now? What's changed about your business that warrants this shift?" hint="Repositioning without a real reason feels hollow. This affects how believable the shift will land.">
        <TA id="repositionReason" value={ctx.repositionReason ?? ''} onChange={v => set('repositionReason', v)}
          placeholder="e.g., We've invested in ethical sourcing and our product quality has significantly improved. Now we need to communicate that change." />
      </QCard>
    </>
  )
}

function ProductLaunchForm({ ctx, set }: { ctx: PurposeContext; set: (k: keyof PurposeContext, v: unknown) => void }) {
  return (
    <>
      <QCard n="01" title="What's the new product, and how is it different from what you already offer?" hint="Both halves matter. The difference is the story we tell.">
        <TA id="productDescription" value={ctx.productDescription ?? ''} onChange={v => set('productDescription', v)}
          placeholder="e.g., Our first wireless earbuds. Same audio quality as our wired line, but with 18-hour battery and active noise cancellation." />
      </QCard>
      <QCard n="02" title="Who is this product for?" hint="This affects the messaging strategy.">
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { id: 'existing', label: 'Existing customers', sub: 'Building on the relationship we have. Loyalty plays.' },
            { id: 'new',      label: 'New segment',        sub: 'Expanding into a new audience. Different messaging needed.' },
            { id: 'both',     label: 'Both',               sub: 'Bridging existing and new. Most complex, most opportunity.' },
          ].map(s => (
            <RadioCard key={s.id} label={s.label} sub={s.sub}
              selected={ctx.targetSegment === s.id} onClick={() => set('targetSegment', s.id)} />
          ))}
        </div>
      </QCard>
      <QCard n="03" title="What's the one thing about this product that's most likely to surprise or excite people?" hint="This is the hook your creative will be built around.">
        <TA id="productHook" value={ctx.productHook ?? ''} onChange={v => set('productHook', v)}
          placeholder="e.g., It's the first earbud in this price range with studio-grade audio. People always expect 'cheaper' to mean 'compromise.'" />
      </QCard>
    </>
  )
}

// ── Consideration forms ──

function LeadGenerationForm({ ctx, set }: { ctx: PurposeContext; set: (k: keyof PurposeContext, v: unknown) => void }) {
  const offers = ctx.leadOffers ?? []
  const toggleOffer = (o: string) => {
    set('leadOffers', offers.includes(o) ? offers.filter(x => x !== o) : [...offers, o])
  }
  return (
    <>
      <QCard n="01" title="What are you asking people to do?" hint="Pick all that apply. A demo request and a newsletter sign-up have very different CPLs — 3–5× apart.">
        <div className="flex flex-wrap gap-2 mt-2">
          {['Demo request', 'Free trial', 'Download (guide/report/template)', 'Consultation call', 'Quote request', 'Newsletter sign-up', 'Waitlist'].map(o => (
            <ChipSelect key={o} label={o} selected={offers.includes(o)} onClick={() => toggleOffer(o)} />
          ))}
        </div>
      </QCard>
      <QCard n="02" title="What happens after someone fills the form?" hint="This calibrates lead-quality expectations and downstream conversion estimates.">
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { id: 'sales-call',    label: 'Immediate sales call',  sub: 'Hot-lead handoff to your sales team. High intent, high cost-per-lead.' },
            { id: 'nurture',       label: 'Nurture sequence',      sub: 'Multi-touch email / content drip. Slower, lower-cost qualification.' },
            { id: 'self-serve',    label: 'Self-serve trial',      sub: 'User activates immediately, product-led from there.' },
            { id: 'human-review',  label: 'Human review & qualify', sub: 'Internal team reviews before reach-out. Quality filter in place.' },
          ].map(f => (
            <RadioCard key={f.id} label={f.label} sub={f.sub}
              selected={ctx.postLeadFlow === f.id} onClick={() => set('postLeadFlow', f.id)} />
          ))}
        </div>
      </QCard>
      <QCard n="03" title="Your current cost per lead, even roughly?" hint="Optional. Leave blank and we'll use industry & geography benchmarks.">
        <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden mt-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <span className="px-4 py-3 text-slate-500 bg-slate-50 border-r border-slate-200 text-sm font-medium">৳</span>
          <input type="number" min="0" placeholder="e.g. 1200"
            value={ctx.currentCplBaseline ?? ''}
            onChange={e => set('currentCplBaseline', e.target.value ? Number(e.target.value) : null)}
            className="flex-1 px-4 py-3 text-sm text-slate-900 outline-none bg-transparent"
          />
          <span className="px-4 py-3 text-slate-500 bg-slate-50 border-l border-slate-200 text-sm">/lead</span>
        </div>
      </QCard>
    </>
  )
}

function EngagementEducationForm({ ctx, set }: { ctx: PurposeContext; set: (k: keyof PurposeContext, v: unknown) => void }) {
  return (
    <>
      <QCard n="01" title="What's the key thing your audience needs to understand before they'll consider you seriously?" hint="Examples: how the category works · why this approach is better · what problem this solves · how you're different from alternatives.">
        <TA id="educationGap" value={ctx.educationGap ?? ''} onChange={v => set('educationGap', v)}
          placeholder="e.g., Subscription dental care is more affordable AND higher quality than the annual check-up model people grew up with." />
      </QCard>
      <QCard n="02" title="Do you already have content that explains this — articles, videos, guides?" hint="If yes, drop a link. If not, we'll include a content-creation brief in your launch plan.">
        <div className="grid grid-cols-2 gap-3 mt-2">
          <RadioCard label="Yes — I have content" sub="We'll lean on what you've made."
            selected={ctx.existingContent === 'yes'} onClick={() => set('existingContent', 'yes')} />
          <RadioCard label="No — the campaign needs to build it" sub="Launch plan will include a content brief."
            selected={ctx.existingContent === 'no'} onClick={() => set('existingContent', 'no')} />
        </div>
        {ctx.existingContent === 'yes' && (
          <div className="mt-4 flex items-center border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <span className="px-3 py-3 text-slate-400 bg-slate-50 border-r border-slate-200 text-sm">https://</span>
            <input type="text" value={ctx.existingContentUrl ?? ''} onChange={e => set('existingContentUrl', e.target.value)}
              placeholder="example.com/your-best-piece"
              className="flex-1 px-4 py-3 text-sm text-slate-900 outline-none bg-transparent"
            />
          </div>
        )}
      </QCard>
    </>
  )
}

function TrafficIntentForm({ ctx, set }: { ctx: PurposeContext; set: (k: keyof PurposeContext, v: unknown) => void }) {
  return (
    <>
      <QCard n="01" title="What page will people land on?" hint="We'll score clarity, CTA, load signal, and message match. A weak page suppresses conversions even with a great campaign — so we flag this before you spend.">
        <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden mt-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <span className="px-3 py-3 text-slate-400 bg-slate-50 border-r border-slate-200 text-sm">https://</span>
          <input type="text" value={ctx.destinationUrl ?? ''} onChange={e => set('destinationUrl', e.target.value)}
            placeholder="example.com/spring-collection"
            className="flex-1 px-4 py-3 text-sm text-slate-900 outline-none bg-transparent"
          />
        </div>
      </QCard>
      <QCard n="02" title="What do you want them to do when they get there?" hint="This determines which on-site behaviour signal we predict.">
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { id: 'browse',   label: 'Browse products',  sub: 'Pages per session, time on site.' },
            { id: 'read',     label: 'Read content',     sub: 'Scroll depth, time on page.' },
            { id: 'signup',   label: 'Sign up',          sub: 'Form starts, completion rate.' },
            { id: 'book',     label: 'Book a call',      sub: 'Calendar slots, booking rate.' },
            { id: 'download', label: 'Download',         sub: 'Asset downloads, return visits.' },
          ].map(a => (
            <RadioCard key={a.id} label={a.label} sub={a.sub}
              selected={ctx.onSiteAction === a.id} onClick={() => set('onSiteAction', a.id)} />
          ))}
        </div>
      </QCard>
    </>
  )
}

// ── Conversion forms ──

function DirectPurchaseForm({ ctx, set }: { ctx: PurposeContext; set: (k: keyof PurposeContext, v: unknown) => void }) {
  const offerTypes = ctx.offerTypes ?? []
  const toggleOffer = (o: string) => set('offerTypes', offerTypes.includes(o) ? offerTypes.filter(x => x !== o) : [...offerTypes, o])
  return (
    <>
      <QCard n="01" title="What's the product being purchased — and what's the price point?" hint="A ৳500 product and a ৳50,000 product need completely different CPA targets, channels, and offer strategies.">
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Product / Service</label>
            <TI id="productName" value={ctx.productName ?? ''} onChange={v => set('productName', v)} placeholder="e.g., Eid kurta collection" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price point</label>
            <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <span className="px-3 py-3 text-slate-400 bg-slate-50 border-r border-slate-200 text-sm">৳</span>
              <input type="number" min="0" value={ctx.pricePoint ?? ''} onChange={e => set('pricePoint', e.target.value ? Number(e.target.value) : null)}
                placeholder="2500"
                className="flex-1 px-4 py-3 text-sm text-slate-900 outline-none bg-transparent"
              />
            </div>
          </div>
        </div>
      </QCard>
      <QCard n="02" title="What's your target ROAS — or maximum CPA?" hint="This is the primary constraint the simulation optimises against.">
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { id: 'roas',    label: 'Target ROAS',         sub: 'Revenue ÷ ad spend, as a multiple.' },
            { id: 'cpa',     label: 'Max CPA',             sub: 'Cost per acquisition ceiling, in taka.' },
            { id: 'unknown', label: 'Use industry benchmark', sub: 'We\'ll suggest one based on your price point.' },
          ].map(t => (
            <RadioCard key={t.id} label={t.label} sub={t.sub}
              selected={ctx.targetType === t.id} onClick={() => set('targetType', t.id)} />
          ))}
        </div>
        {ctx.targetType && ctx.targetType !== 'unknown' && (
          <div className="mt-4 flex items-center border-2 border-slate-200 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <span className="px-3 py-3 text-slate-400 bg-slate-50 border-r border-slate-200 text-sm">{ctx.targetType === 'roas' ? '×' : '৳'}</span>
            <input type="number" step="0.1" min="0"
              value={ctx.targetValue ?? ''}
              onChange={e => set('targetValue', e.target.value ? Number(e.target.value) : null)}
              placeholder={ctx.targetType === 'roas' ? '3.5' : '450'}
              className="flex-1 px-4 py-3 text-sm text-slate-900 outline-none bg-transparent"
            />
            <span className="px-3 py-3 text-slate-400 bg-slate-50 border-l border-slate-200 text-sm">{ctx.targetType === 'roas' ? 'ROAS' : 'max CPA'}</span>
          </div>
        )}
      </QCard>
      <QCard n="03" title="What's the offer?" hint="The offer is the single biggest lever at conversion — competing on full price requires a stronger product than competing on 25% off.">
        <div className="flex flex-wrap gap-2 mt-2">
          {['Full price', 'Discount %', 'Bundle deal', 'Free shipping', 'Money-back guarantee', 'Limited edition', 'BOGO'].map(o => (
            <ChipSelect key={o} label={o} selected={offerTypes.includes(o)} onClick={() => toggleOffer(o)} />
          ))}
        </div>
      </QCard>
    </>
  )
}

function SignupTrialForm({ ctx, set }: { ctx: PurposeContext; set: (k: keyof PurposeContext, v: unknown) => void }) {
  return (
    <>
      <QCard n="01" title="What exactly are you asking people to do?" hint="Each has very different conversion-rate benchmarks and friction profiles.">
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[
            { id: 'app',          label: 'Download an app',   sub: 'CPI is the primary metric. Store quality matters.' },
            { id: 'free-account', label: 'Free account',      sub: 'Email + password. Low friction, high volume.' },
            { id: 'paid-trial',   label: 'Paid trial',        sub: 'Trial-to-paid conversion downstream is key.' },
            { id: 'waitlist',     label: 'Waitlist',          sub: 'Lowest friction. Volume play to seed launch.' },
          ].map(s => (
            <RadioCard key={s.id} label={s.label} sub={s.sub}
              selected={ctx.signupType === s.id} onClick={() => set('signupType', s.id)} />
          ))}
        </div>
      </QCard>
      <QCard n="02" title="Is a credit card required to sign up?" hint="No-card trials convert at 2–4× the rate of card-required trials. This dramatically shifts CVR benchmarks.">
        <div className="grid grid-cols-3 gap-3 mt-2">
          {[
            { id: 'no',       label: 'No card needed',  sub: 'Highest sign-up CVR.' },
            { id: 'optional', label: 'Optional',        sub: 'Mixed — depends on UX.' },
            { id: 'yes',      label: 'Card required',   sub: 'Lower CVR but higher intent.' },
          ].map(p => (
            <RadioCard key={p.id} label={p.label} sub={p.sub}
              selected={ctx.paymentRequired === p.id} onClick={() => set('paymentRequired', p.id)} />
          ))}
        </div>
      </QCard>
      <QCard n="03" title="Your current cost per install or sign-up?" hint="Optional. Leave blank and we'll use app-category & geography benchmarks.">
        <div className="flex items-center border-2 border-slate-200 rounded-xl overflow-hidden mt-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <span className="px-4 py-3 text-slate-500 bg-slate-50 border-r border-slate-200 text-sm font-medium">৳</span>
          <input type="number" min="0" placeholder="e.g. 80"
            value={ctx.currentCpiBaseline ?? ''}
            onChange={e => set('currentCpiBaseline', e.target.value ? Number(e.target.value) : null)}
            className="flex-1 px-4 py-3 text-sm text-slate-900 outline-none bg-transparent"
          />
          <span className="px-4 py-3 text-slate-500 bg-slate-50 border-l border-slate-200 text-sm">/sign-up</span>
        </div>
      </QCard>
    </>
  )
}

function FlashSaleForm({ ctx, set }: { ctx: PurposeContext; set: (k: keyof PurposeContext, v: unknown) => void }) {
  return (
    <>
      <QCard n="01" title="What's the promotion — and how does it compare to competitors?" hint="During Eid, market-average modest-fashion discounts run 20–25%. A 15% offer is below the category norm and will suppress CVR.">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-2">The offer</label>
        <TI id="promoOffer" value={ctx.promoOffer ?? ''} onChange={v => set('promoOffer', v)}
          placeholder="e.g., 25% off everything · Buy 2 get 1 free" />
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-4">vs category / competitors</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'below',   label: 'Below norm' },
            { id: 'at',      label: 'At the norm' },
            { id: 'above',   label: 'Above norm' },
            { id: 'unknown', label: "Don't know" },
          ].map(s => (
            <RadioCard key={s.id} label={s.label}
              selected={ctx.promoStrength === s.id} onClick={() => set('promoStrength', s.id)} />
          ))}
        </div>
      </QCard>
      <QCard n="02" title="When does the promotion run?" hint="We model a pacing curve: heavier spend on Day 1 (launch buzz) and the final 48 hours (last-chance urgency).">
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start date</label>
            <TI id="promoStart" type="date" value={ctx.promoStart ?? ''} onChange={v => set('promoStart', v)} placeholder="" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End date</label>
            <TI id="promoEnd" type="date" value={ctx.promoEnd ?? ''} onChange={v => set('promoEnd', v)} placeholder="" />
          </div>
        </div>
      </QCard>
      <QCard n="03" title="Is the urgency visible in your creative?" hint={'"Ends Sunday at midnight" beats "Limited time only" every time. Implicit deadlines don’t move people.'}>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <RadioCard label="Yes — explicit deadline in the creative" sub="Specific end date / countdown / final-day callout."
            selected={ctx.urgencyVisible === 'yes'} onClick={() => set('urgencyVisible', 'yes')} />
          <RadioCard label="No — we'll need to add it" sub="Launch plan will flag this for revision."
            selected={ctx.urgencyVisible === 'no'} onClick={() => set('urgencyVisible', 'no')} />
        </div>
      </QCard>
    </>
  )
}

const PURPOSE_FORMS: Record<string, React.ComponentType<{ ctx: PurposeContext; set: (k: keyof PurposeContext, v: unknown) => void }>> = {
  'new-brand':              NewBrandForm,
  'repositioning':          RepositioningForm,
  'product-launch':         ProductLaunchForm,
  'lead-generation':        LeadGenerationForm,
  'engagement-education':   EngagementEducationForm,
  'traffic-intent':         TrafficIntentForm,
  'direct-purchase':        DirectPurchaseForm,
  'signup-trial':           SignupTrialForm,
  'flash-sale':             FlashSaleForm,
}

function purposeCanContinue(subPurpose: string, ctx: PurposeContext): boolean {
  switch (subPurpose) {
    case 'new-brand':
      return (ctx.brandPersonality?.filter(w => w.trim()).length ?? 0) >= 2
        && (ctx.coreMessage?.trim().length ?? 0) >= 10
    case 'repositioning':
      return (ctx.currentPerception?.trim().length ?? 0) >= 15
        && (ctx.desiredPerception?.trim().length ?? 0) >= 15
        && (ctx.repositionReason?.trim().length ?? 0) >= 10
    case 'product-launch':
      return (ctx.productDescription?.trim().length ?? 0) >= 20
        && !!ctx.targetSegment
        && (ctx.productHook?.trim().length ?? 0) >= 10
    case 'lead-generation':
      return (ctx.leadOffers?.length ?? 0) >= 1 && !!ctx.postLeadFlow
    case 'engagement-education':
      return (ctx.educationGap?.trim().length ?? 0) >= 15 && !!ctx.existingContent
    case 'traffic-intent':
      return (ctx.destinationUrl?.trim().length ?? 0) >= 5 && !!ctx.onSiteAction
    case 'direct-purchase':
      return (ctx.productName?.trim().length ?? 0) >= 2
        && (ctx.pricePoint ?? 0) > 0
        && !!ctx.targetType
        && (ctx.offerTypes?.length ?? 0) >= 1
    case 'signup-trial':
      return !!ctx.signupType && !!ctx.paymentRequired
    case 'flash-sale':
      return (ctx.promoOffer?.trim().length ?? 0) >= 3
        && !!ctx.promoStrength
        && !!ctx.promoStart && !!ctx.promoEnd
        && !!ctx.urgencyVisible
    default:
      return true
  }
}

// ─── Step 3: Channels ─────────────────────────────────────────────────────────

function ChannelsStep({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id])
  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Where will you run this campaign?</h1>
      <p className="text-slate-500 text-sm mb-6">Pick all the channels you want to use. We'll predict performance per channel and combined.</p>
      <div className="grid grid-cols-4 gap-3">
        {CHANNELS.map(ch => {
          const sel = value.includes(ch.id)
          return (
            <button key={ch.id} type="button" onClick={() => toggle(ch.id)}
              className={`relative flex flex-col items-center gap-2 pt-4 pb-3 px-2 rounded-xl border-2 transition-all duration-200 overflow-hidden
                ${sel ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: ch.color }} />
              <span className="text-xs font-semibold text-center text-slate-700 leading-tight mt-0.5">{ch.label}</span>
              {sel && (
                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-700 flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">✓</span>
                </span>
              )}
            </button>
          )
        })}
      </div>
      {value.length > 0 && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl">
          <span className="text-indigo-700 font-semibold text-sm">{value.length} channel{value.length !== 1 ? 's' : ''} selected</span>
          <span className="text-indigo-400 text-sm">·</span>
          <span className="text-indigo-600 text-sm">{value.map(id => CHANNELS.find(c => c.id === id)?.label).join(', ')}</span>
        </div>
      )}
    </div>
  )
}

// ─── Step 4: Creative ─────────────────────────────────────────────────────────

function CreativeStep({
  adCopy, onAdCopy,
  imagePreview, onImage,
}: {
  adCopy: string; onAdCopy: (v: string) => void
  imagePreview: string | undefined; onImage: (f: File) => void
}) {
  const [dragging, setDragging] = useState(false)
  const handleFile = (file: File | undefined) => { if (file && file.type.startsWith('image/')) onImage(file) }

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Your campaign creative.</h1>
      <p className="text-slate-500 text-sm mb-6">Drop your ad copy and creative image. BrandAid will analyze hook strength, clarity, and CTA quality.</p>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Ad Copy <span className="text-red-500">*</span></label>
            <span className="text-xs text-slate-400">{adCopy.length} chars</span>
          </div>
          <textarea value={adCopy} onChange={e => onAdCopy(e.target.value)} required rows={5}
            placeholder="Paste your ad copy here — headline, body, and CTA..."
            className="w-full bg-[#FAFAFE] border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Campaign Image</label>
            <span className="text-xs text-slate-400">optional</span>
          </div>
          <label
            className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 overflow-hidden
              ${dragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30'}`}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center select-none">
                <div className="text-2xl mb-1.5 text-indigo-600" style={{ animationDuration: '2s' }}>⬆</div>
                <p className="text-slate-600 text-sm font-semibold">Drop image or click to upload</p>
                <p className="text-slate-400 text-xs mt-0.5">PNG · JPG · WEBP</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
          </label>
        </div>
      </div>
    </div>
  )
}

// ─── Step 5: Audience ─────────────────────────────────────────────────────────

function AudienceStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Who are you trying to reach?</h1>
      <p className="text-slate-500 text-sm mb-6">Describe your target audience. The more specific, the sharper the persona simulation.</p>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={4}
        placeholder="e.g., Women aged 22–38 in urban South Asia, interested in modest fashion and online shopping. Active on Instagram and TikTok."
        className="w-full bg-[#FAFAFE] border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
      />
      <p className="text-xs text-slate-400 mt-2">Include demographics, interests, behaviors, and platform habits for best results.</p>
    </div>
  )
}

// ─── Step 6: Budget ───────────────────────────────────────────────────────────

function BudgetStep({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const pct = SLIDER_MAX > SLIDER_MIN ? ((value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100 : 0

  function handleText(raw: string) {
    const n = parseInt(raw.replace(/[^0-9]/g, ''), 10)
    onChange(isNaN(n) ? 0 : Math.min(SLIDER_MAX, n))
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">What's your total budget?</h1>
      <p className="text-slate-500 text-sm mb-6">BrandAid will optimize the spend split across your selected channels.</p>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-2xl font-semibold text-slate-400">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={value === 0 ? '' : value.toLocaleString()}
              onChange={e => handleText(e.target.value)}
              placeholder="0"
              className="text-5xl font-black text-slate-900 tabular-nums tracking-tight text-center bg-transparent border-none outline-none w-52 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <p className="text-slate-400 text-sm mt-1">USD — type or use the slider</p>
        </div>

        <div className="relative h-2 bg-slate-200 rounded-full">
          <div className="absolute left-0 top-0 h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
          <input type="range" min={SLIDER_MIN} max={SLIDER_MAX} step={500} value={value}
            onChange={e => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          />
          <div className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-[3px] border-indigo-600 rounded-full shadow pointer-events-none"
            style={{ left: `calc(${pct}% - 10px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>$0</span>
          <span>$1M</span>
        </div>

        <div className="flex gap-2 flex-wrap mt-4">
          {BUDGET_PRESETS.map(p => (
            <button key={p} type="button" onClick={() => onChange(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
                ${value === p ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700'}`}
            >
              {fmtBudget(p)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 7: Review ───────────────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-28 flex-shrink-0 mt-0.5">{label}</span>
      <span className="text-sm font-medium text-slate-800 flex-1">{value}</span>
    </div>
  )
}

function ReviewStep({
  goal, subPurpose, channels, adCopy, targetAudience, budgetValue, imagePreview
}: {
  goal: string; subPurpose: string; channels: string[]; adCopy: string
  targetAudience: string; budgetValue: number; imagePreview: string | undefined
}) {
  const goalLabel = GOALS.find(g => g.id === goal)?.label ?? goal
  const purposeLabel = PURPOSE_OPTIONS[goal]?.find(p => p.id === subPurpose)?.label ?? subPurpose
  const channelLabels = channels.map(id => CHANNELS.find(c => c.id === id)?.label ?? id).join(', ')

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Ready to simulate.</h1>
      <p className="text-slate-500 text-sm mb-6">Review your campaign setup before running the AI simulation.</p>

      <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200 rounded-2xl p-6 mb-5">
        <ReviewRow label="Goal" value={`${goalLabel} → ${purposeLabel}`} />
        <ReviewRow label="Channels" value={channelLabels || 'None selected'} />
        <ReviewRow label="Audience" value={targetAudience || '—'} />
        <ReviewRow label="Budget" value={`$${budgetValue.toLocaleString()} USD`} />
        {adCopy && (
          <ReviewRow label="Ad Copy" value={adCopy.length > 120 ? adCopy.slice(0, 117) + '...' : adCopy} />
        )}
        {imagePreview && (
          <div className="flex items-start py-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 w-28 flex-shrink-0 mt-0.5">Image</span>
            <img src={imagePreview} alt="Creative" className="h-12 rounded-lg object-cover" />
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600">
        <span className="text-indigo-600 font-bold mt-0.5">⚡</span>
        <p>The simulation generates 3 synthetic audience personas, forecasts performance metrics, and provides AI-powered recommendations tailored to your {goalLabel.toLowerCase()} goal. Takes ~15–30 seconds.</p>
      </div>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  onSimulationStart: (summary: { objective: string; platform: string }, adCopy: string) => void
  onSimulationComplete: (result: SimulationResult) => void
  onError: (error: string) => void
  errorMessage?: string | null
}

export default function InputPage({ onSimulationStart, onSimulationComplete, onError, errorMessage }: Props) {
  const [step, setStep] = useState(1)
  const [purposeScreen, setPurposeScreen] = useState<'select' | 'configure'>('select')

  // Form state
  const [goal, setGoal] = useState('')
  const [subPurpose, setSubPurpose] = useState('')
  const [ctx, setCtx] = useState<PurposeContext>({})
  const [channels, setChannels] = useState<string[]>([])
  const [adCopy, setAdCopy] = useState('')
  const [image, setImage] = useState<File | undefined>()
  const [imagePreview, setImagePreview] = useState<string | undefined>()
  const [targetAudience, setTargetAudience] = useState('')
  const [budgetValue, setBudgetValue] = useState(5000)

  const setCtxField = (k: keyof PurposeContext, v: unknown) =>
    setCtx(prev => ({ ...prev, [k]: v }))

  // ── Navigation logic ──

  const canGoNext = (): boolean => {
    if (step === 1) return !!goal
    if (step === 2) {
      if (purposeScreen === 'select') return !!subPurpose
      return purposeCanContinue(subPurpose, ctx)
    }
    if (step === 3) return channels.length > 0
    if (step === 4) return adCopy.trim().length > 0
    if (step === 5) return targetAudience.trim().length > 0
    if (step === 6) return true
    if (step === 7) return true
    return false
  }

  const handleNext = () => {
    if (!canGoNext()) return
    if (step === 2 && purposeScreen === 'select') {
      setPurposeScreen('configure')
      return
    }
    if (step === 2 && purposeScreen === 'configure') {
      setStep(3)
      return
    }
    setStep(s => Math.min(s + 1, TOTAL_STEPS))
  }

  const handleBack = () => {
    if (step === 2 && purposeScreen === 'configure') {
      setPurposeScreen('select')
      return
    }
    if (step === 2 && purposeScreen === 'select') {
      setStep(1)
      return
    }
    setStep(s => Math.max(s - 1, 1))
  }

  const handleGoalChange = (g: string) => {
    setGoal(g)
    setSubPurpose('')
    setCtx({})
    setPurposeScreen('select')
  }

  const handleImageChange = (file: File) => {
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // ── Submit ──

  const handleSubmit = async () => {
    const objective = `${GOALS.find(g => g.id === goal)?.label ?? goal} — ${PURPOSE_OPTIONS[goal]?.find(p => p.id === subPurpose)?.label ?? subPurpose}`
    const platform = channels[0] ?? goal

    onSimulationStart({ objective, platform }, adCopy)

    const input: CampaignInput = {
      goal,
      sub_purpose: subPurpose,
      purpose_context: ctx,
      channels,
      target_audience: targetAudience,
      budget: `$${budgetValue.toLocaleString()} USD`,
      ad_copy: adCopy,
      image,
      objective,
      platform,
    }

    try {
      const result = await runSimulation(input)
      onSimulationComplete(result)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  // ── Render ──

  const PurposeForm = subPurpose ? PURPOSE_FORMS[subPurpose] : null
  const goalPurposeOptions = goal ? PURPOSE_OPTIONS[goal] : []

  const isLastStep = step === TOTAL_STEPS

  return (
    <div className="min-h-screen bg-[#FAFAFE]">
      {/* Top bar */}
      <header className="h-[60px] bg-white border-b border-slate-200 px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-base">+</div>
          <span className="text-base font-bold text-slate-900 tracking-tight">BrandAid</span>
          <span className="text-slate-300 text-sm mx-1">›</span>
          <span className="text-sm text-slate-500">New Campaign</span>
        </div>
        <button type="button" className="text-sm text-slate-500 hover:text-slate-800 transition-colors">Save & exit</button>
      </header>

      {/* Main */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <StepIndicator step={step} />
        <StepLabel step={step} />

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">

          {step === 1 && <GoalStep value={goal} onChange={handleGoalChange} />}

          {step === 2 && purposeScreen === 'select' && (
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                {goal === 'awareness' ? 'What\'s driving this campaign?' :
                 goal === 'consideration' ? 'What does "consideration" look like for you?' :
                 'What does a conversion look like for you?'}
              </h1>
              <p className="text-slate-500 text-sm mb-6">
                Knowing this lets me set the right benchmarks and predict the right outcomes.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {goalPurposeOptions.map(opt => (
                  <button key={opt.id} type="button"
                    onClick={() => setSubPurpose(opt.id)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all duration-200
                      ${subPurpose === opt.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm mb-1">{opt.label}</div>
                        <div className="text-slate-500 text-sm">{opt.desc}</div>
                        <div className="mt-2 text-xs text-slate-400 italic">{opt.when}</div>
                      </div>
                      {subPurpose === opt.id && (
                        <div className="w-5 h-5 rounded-full bg-indigo-700 flex items-center justify-center flex-shrink-0 ml-4">
                          <span className="text-white text-[9px] font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && purposeScreen === 'configure' && PurposeForm && (
            <div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Selected purpose</span>
                <span className="text-sm font-semibold text-slate-800 flex-1 ml-2">
                  {PURPOSE_OPTIONS[goal]?.find(p => p.id === subPurpose)?.label}
                </span>
                <button type="button" onClick={() => setPurposeScreen('select')}
                  className="text-xs font-semibold text-indigo-600 hover:underline">Change</button>
              </div>
              <PurposeForm ctx={ctx} set={setCtxField} />
            </div>
          )}

          {step === 3 && <ChannelsStep value={channels} onChange={setChannels} />}

          {step === 4 && (
            <CreativeStep
              adCopy={adCopy} onAdCopy={setAdCopy}
              imagePreview={imagePreview} onImage={handleImageChange}
            />
          )}

          {step === 5 && <AudienceStep value={targetAudience} onChange={setTargetAudience} />}

          {step === 6 && <BudgetStep value={budgetValue} onChange={setBudgetValue} />}

          {step === 7 && (
            <ReviewStep
              goal={goal} subPurpose={subPurpose} channels={channels}
              adCopy={adCopy} targetAudience={targetAudience}
              budgetValue={budgetValue} imagePreview={imagePreview}
            />
          )}

          {errorMessage && (
            <div className="mt-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm">
              <span className="text-red-500 font-bold flex-shrink-0 mt-0.5">✕</span>
              <div>
                <p className="font-semibold text-red-700">Simulation failed</p>
                <p className="text-red-600 mt-0.5 text-xs leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between mt-6">
          <button type="button" onClick={handleBack}
            disabled={step === 1 && purposeScreen === 'select'}
            className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>

          <span className="text-sm font-semibold text-slate-400">
            {step === 2 && purposeScreen === 'configure' ? 'Step 2b of 7' : `Step ${step} of ${TOTAL_STEPS}`}
          </span>

          {isLastStep ? (
            <button type="button" onClick={handleSubmit}
              className="px-8 py-3 rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-900 text-white text-sm font-bold shadow-[0_12px_30px_-8px_rgba(67,56,202,0.5)] hover:shadow-[0_18px_40px_-8px_rgba(67,56,202,0.6)] hover:-translate-y-0.5 transition-all duration-200"
            >
              Run Simulation →
            </button>
          ) : (
            <button type="button" onClick={handleNext}
              disabled={!canGoNext()}
              className="px-8 py-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
