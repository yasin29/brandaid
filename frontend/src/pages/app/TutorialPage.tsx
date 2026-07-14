import { useState } from 'react'
import {
  Target, ListChecks, Radio, ImageIcon, Users, DollarSign, ClipboardCheck,
  Loader2, BarChart3, ShieldCheck, Lightbulb, MessagesSquare, GitCompare,
  Sparkles, PlayCircle, CheckCircle2,
} from 'lucide-react'

// Paste the YouTube video ID here once you have it (the part after "v=" in the URL).
// e.g. "https://www.youtube.com/watch?v=dQw4w9WgXcQ" -> "dQw4w9WgXcQ"
const TUTORIAL_VIDEO_ID = ''

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5 flex items-center gap-2">
      <span className="h-px flex-1 bg-white/5" />
      {children}
      <span className="h-px flex-1 bg-white/5" />
    </h2>
  )
}

type Step = {
  n: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  desc: string
  tip?: string
  img: string
}

const WIZARD_STEPS: Step[] = [
  {
    n: '01', icon: Target, title: 'Pick your goal',
    desc: 'Every campaign starts with what stage of the funnel you\'re targeting. Awareness (top of funnel, ~100% of audience), Consideration (mid funnel, ~40%), or Conversion (bottom funnel, ~10%). This one choice reshapes everything downstream — which metrics get predicted, how personas are framed, and what the AI optimizes for.',
    tip: 'Not sure? If you\'re asking people to buy, sign up, or install something right now, pick Conversion.',
    img: '/tutorial/03-step1-goal.png',
  },
  {
    n: '02', icon: ListChecks, title: 'Narrow the purpose',
    desc: 'Each goal branches into 3 specific sub-purposes (9 total across the app). Conversion splits into Direct purchase, Sign-up/Trial/Install, and Flash sale — each with a different context form because a ৳500 impulse buy and a SaaS trial need completely different benchmarks.',
    img: '/tutorial/04-step2-purpose-select.png',
  },
  {
    n: '02b', icon: ListChecks, title: 'Answer the context questions',
    desc: 'A short, purpose-specific form appears — product name and price point, target ROAS or max CPA, and the offer type. These answers get injected into every AI pipeline stage to sharpen persona reactions and forecast accuracy. The more specific you are here, the sharper the simulation.',
    img: '/tutorial/05-step2b-purpose-config.png',
  },
  {
    n: '03', icon: Radio, title: 'Choose your channels',
    desc: 'Select every platform you\'re considering — Meta, TikTok, Google Search, LinkedIn, email, SMS, and more. Brand-AId predicts performance per channel and combined, using real CTR/ROAS benchmark ranges for each platform.',
    img: '/tutorial/07-step3-channels.png',
  },
  {
    n: '04', icon: ImageIcon, title: 'Drop in your creative',
    desc: 'Paste your ad copy and, optionally, upload the campaign image. The multimodal AI analyzer scores both together across 6 dimensions: emotional tone, CTA strength, audience fit, trust signals, clarity, and emotional appeal.',
    tip: 'Uploading an image matters — vision analysis catches things like a mismatched product, weak visual hierarchy, or missing brand cues that text-only analysis would miss.',
    img: '/tutorial/08-step4-creative.png',
  },
  {
    n: '05', icon: Users, title: 'Describe your audience',
    desc: 'Free-text description of who you\'re targeting — demographics, interests, platform habits. This feeds live web research (DuckDuckGo search, grounded in real 2024-2025 data) and the persona generator that builds 3 distinct synthetic reactions to your campaign.',
    tip: 'Specificity wins. "Women 22-38" is weak. "Women 22-38 in urban South Asia, into modest fashion, active on Instagram and TikTok" gives the AI something real to work with.',
    img: '/tutorial/09-step5-audience.png',
  },
  {
    n: '06', icon: DollarSign, title: 'Set your budget',
    desc: 'Type an amount or drag the slider ($0 to $1M). This determines the spend tier used in the ML forecast model and shapes the recommended platform split.',
    img: '/tutorial/10-step6-budget.png',
  },
  {
    n: '07', icon: ClipboardCheck, title: 'Review and launch',
    desc: 'A final summary of everything you\'ve entered — goal, channels, audience, budget, ad copy, and image. Once it looks right, hit Run Simulation. The full pipeline (analysis → research → personas → forecast → recommendations → re-simulation → QA) takes about 15-30 seconds.',
    img: '/tutorial/11-step7-review.png',
  },
]

const RESULT_SECTIONS: Step[] = [
  {
    n: '', icon: Loader2, title: 'While it\'s running',
    desc: 'The processing screen shows all 6 pipeline stages as they complete in real time — campaign analysis, persona generation, audience simulation, forecasting, recommendations, and the re-simulation pass. Nothing to do here but watch it work.',
    img: '/tutorial/12-processing.png',
  },
  {
    n: '', icon: BarChart3, title: 'The scorecard',
    desc: 'The top of your results: overall campaign score out of 100, predicted CTR range, an engagement read, and ROI direction (Positive / Neutral / Negative). The AI Confidence Breakdown underneath shows how sure the model is about tone & copy, audience fit, and trust signals specifically.',
    img: '/tutorial/13-results-top.png',
  },
  {
    n: '', icon: ShieldCheck, title: 'Campaign analysis & QA review',
    desc: 'A dimension-by-dimension breakdown ("What\'s working" vs "Watch out for") backing up the overall score, visualized as a radar chart. Below it, an independent QA reviewer agent audits the whole simulation for consistency — flagging anything that doesn\'t add up before you trust the numbers.',
    img: '/tutorial/14-results-analysis.png',
  },
  {
    n: '', icon: Lightbulb, title: 'AI recommendations & risks',
    desc: 'Ranked, concrete fixes — a stronger CTA, refined audience segments, platform-specific strategy — plus the specific risks the AI identified (creative fatigue, trust variability, tracking limitations). These aren\'t generic advice; they\'re tied directly to what your specific campaign got wrong.',
    img: '/tutorial/15-results-recommendations.png',
  },
  {
    n: '', icon: MessagesSquare, title: 'Meet your synthetic audience',
    desc: 'Three distinct personas react to your exact campaign — each with an engagement/trust/conversion read and their own specific objections or questions. This is the closest thing to real user feedback you\'ll get before spending a dollar.',
    img: '/tutorial/16-results-personas.png',
  },
  {
    n: '', icon: GitCompare, title: 'Before vs. after',
    desc: 'The AI rewrites your copy using its own recommendations and reruns the forecast. You get a direct side-by-side: original vs. optimized CTR, ROI, and copy — so you can see exactly what the recommendations are worth before you decide whether to use them.',
    img: '/tutorial/17-results-before-after.png',
  },
]

function StepCard({ step }: { step: Step }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-[#0D0D15] border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex-none w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <step.icon className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {step.n && <span className="text-[10px] font-bold text-slate-600">{step.n}</span>}
            <span className="text-sm font-bold text-white">{step.title}</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
          {step.tip && (
            <div className="mt-3 flex items-start gap-2 bg-amber-500/8 border border-amber-500/15 rounded-xl px-3 py-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-none mt-0.5" />
              <p className="text-xs text-amber-200/90 leading-relaxed">{step.tip}</p>
            </div>
          )}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <img
            src={step.img}
            alt={step.title}
            className="w-full rounded-xl border border-white/10"
            loading="lazy"
          />
        </div>
      )}
    </div>
  )
}

function VideoSection() {
  if (!TUTORIAL_VIDEO_ID) {
    return (
      <div className="bg-[#0D0D15] border border-white/5 rounded-2xl p-10 text-center">
        <PlayCircle className="w-8 h-8 text-slate-700 mx-auto mb-3" />
        <p className="text-sm text-slate-500">Video walkthrough coming soon.</p>
      </div>
    )
  }
  return (
    <div className="bg-[#0D0D15] border border-white/5 rounded-2xl overflow-hidden">
      <div className="aspect-video">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${TUTORIAL_VIDEO_ID}`}
          title="Brand-AId walkthrough"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}

const TIPS = [
  'Be specific in the audience field — demographics + interests + platform habits gives the AI real signal to work with.',
  'Upload a real creative image when you have one. Vision analysis catches issues text-only analysis misses.',
  'Fill in the purpose context fields honestly, even the optional ones — they directly sharpen forecast accuracy.',
  'Read the QA Reviewer notes before trusting the numbers — it independently audits the simulation for internal consistency.',
  'Always check the Before/After comparison — the point of the recommendations is measurable lift, not just advice.',
  'Rerun with edits after applying a recommendation to see the actual delta, rather than assuming it helped.',
]

export default function TutorialPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-14">

      {/* Hero */}
      <div>
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
          Tutorial
        </span>
        <h1 className="text-4xl font-black text-white tracking-tight mt-3 mb-3">How to use Brand-AId</h1>
        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
          A complete walkthrough of the 7-step campaign wizard and how to read your results —
          from goal to launch-ready recommendations.
        </p>
      </div>

      {/* Video */}
      <div>
        <SectionTitle>Watch the Walkthrough</SectionTitle>
        <VideoSection />
      </div>

      {/* Wizard steps */}
      <div>
        <SectionTitle>The 7-Step Wizard</SectionTitle>
        <div className="space-y-3">
          {WIZARD_STEPS.map(s => <StepCard key={s.title} step={s} />)}
        </div>
      </div>

      {/* Results */}
      <div>
        <SectionTitle>Reading Your Results</SectionTitle>
        <div className="space-y-3">
          {RESULT_SECTIONS.map(s => <StepCard key={s.title} step={s} />)}
        </div>
      </div>

      {/* Tips */}
      <div>
        <SectionTitle>Tips to Get the Best Results</SectionTitle>
        <div className="bg-[#0D0D15] border border-white/5 rounded-2xl p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TIPS.map(tip => (
              <div key={tip} className="flex items-start gap-2.5 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-none mt-0.5" />
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
