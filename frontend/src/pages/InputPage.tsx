import { useState } from 'react'
import type { CampaignInput, SimulationResult } from '@/types'
import { runSimulation } from '@/lib/api'

// ── Platform tiles ─────────────────────────────────────────────────────────────

const PLATFORMS = [
  { name: 'Instagram',  color: '#E1306C', emoji: '📸' },
  { name: 'LinkedIn',   color: '#0A66C2', emoji: '💼' },
  { name: 'TikTok',     color: '#EE1D52', emoji: '🎵' },
  { name: 'Facebook',   color: '#1877F2', emoji: '👍' },
  { name: 'Google Ads', color: '#4285F4', emoji: '🔍' },
  { name: 'Twitter/X',  color: '#14171A', emoji: '✕' },
  { name: 'YouTube',    color: '#FF0000', emoji: '▶' },
]

function PlatformGrid({
  selected,
  onChange,
}: { selected: string; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {PLATFORMS.map(p => {
        const isSelected = selected === p.name
        return (
          <button
            key={p.name}
            type="button"
            onClick={() => onChange(p.name)}
            className={`relative flex flex-col items-center gap-1.5 pt-3 pb-2.5 px-2 rounded-xl border-2 transition-all duration-200 overflow-hidden
              ${isSelected
                ? 'border-indigo-600 bg-indigo-50 shadow-[0_0_0_4px_rgba(67,56,202,0.1)]'
                : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
              }`}
          >
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ backgroundColor: p.color, opacity: isSelected ? 1 : 0.45 }}
            />
            <span className="text-lg leading-none">{p.emoji}</span>
            <span className={`text-[11px] font-semibold text-center leading-tight ${isSelected ? 'text-indigo-700' : 'text-slate-600'}`}>
              {p.name}
            </span>
            {isSelected && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">✓</span>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Budget slider ──────────────────────────────────────────────────────────────

const BUDGET_PRESETS = [500, 1000, 5000, 10000, 50000]
const SLIDER_MIN = 100
const SLIDER_MAX = 100000

function formatBudget(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K` : `$${v}`
}

function BudgetSlider({
  value,
  onChange,
}: { value: number; onChange: (v: number) => void }) {
  const pct = ((value - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100

  return (
    <div className="space-y-4">
      {/* Big number */}
      <div className="text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-2xl font-semibold text-slate-400">$</span>
          <span className="text-5xl font-black text-slate-900 tabular-nums tracking-tight">
            {value.toLocaleString()}
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">per month</p>
      </div>

      {/* Track */}
      <div className="relative h-2 bg-slate-200 rounded-full mt-5">
        <div
          className="absolute left-0 top-0 h-full bg-indigo-600 rounded-full"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={100}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-[3px] border-indigo-600 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.15)] pointer-events-none"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>$100</span>
        <span>$100K</span>
      </div>

      {/* Presets */}
      <div className="flex gap-2 flex-wrap">
        {BUDGET_PRESETS.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
              ${value === p
                ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-700'
              }`}
          >
            {formatBudget(p)}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Dropzone ───────────────────────────────────────────────────────────────────

function Dropzone({
  preview,
  onChange,
}: { preview: string | undefined; onChange: (f: File) => void }) {
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (file && file.type.startsWith('image/')) onChange(file)
  }

  return (
    <label
      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 overflow-hidden
        ${dragging
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/40'
        }`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
    >
      {preview ? (
        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
      ) : (
        <div className="text-center select-none">
          <div
            className={`text-3xl mb-2 transition-transform duration-200 ${dragging ? 'scale-110' : 'animate-bounce'}`}
            style={{ animationDuration: '2s', color: '#4338CA' }}
          >
            ⬆
          </div>
          <p className="text-slate-600 text-sm font-semibold">Drop image or click to upload</p>
          <p className="text-slate-400 text-xs mt-0.5">PNG · JPG · WEBP</p>
        </div>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
    </label>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  onSimulationStart: (summary: { objective: string; platform: string }) => void
  onSimulationComplete: (result: SimulationResult) => void
  onError: (error: string) => void
}

export default function InputPage({ onSimulationStart, onSimulationComplete, onError }: Props) {
  const [form, setForm] = useState<CampaignInput>({
    objective: '',
    platform: '',
    target_audience: '',
    budget: '',
    ad_copy: '',
  })
  const [budgetValue, setBudgetValue] = useState(1000)
  const [image, setImage] = useState<File | undefined>()
  const [imagePreview, setImagePreview] = useState<string | undefined>()

  const handleImageChange = (file: File) => {
    setImage(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const campaignData = { ...form, budget: `$${budgetValue.toLocaleString()}/month`, image }
    onSimulationStart({ objective: form.objective, platform: form.platform })
    try {
      const result = await runSimulation(campaignData)
      onSimulationComplete(result)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const canSubmit = form.objective && form.platform && form.target_audience && form.ad_copy

  return (
    <div className="min-h-screen bg-[#FAFAFE]">

      {/* Top bar */}
      <header className="h-[60px] bg-white border-b border-slate-200 px-8 flex items-center">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-700 rounded-lg flex items-center justify-center text-white font-bold text-base">+</div>
          <span className="text-base font-bold text-slate-900 tracking-tight">BrandAid</span>
        </div>
        <span className="ml-3 text-slate-300 text-sm">›</span>
        <span className="ml-2 text-sm text-slate-500">New Campaign</span>
      </header>

      {/* Form area */}
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Page heading */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
            AI Campaign Simulation Engine
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">New Campaign</h1>
          <p className="text-slate-500 text-sm mt-2">Test your campaign against a synthetic market before launch.</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Objective */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Campaign Objective</label>
              <input
                type="text"
                placeholder="e.g. Increase sign-ups by 20%"
                value={form.objective}
                onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            {/* Platform tiles */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Platform</label>
              <PlatformGrid selected={form.platform} onChange={v => setForm(f => ({ ...f, platform: v }))} />
            </div>

            {/* Target audience */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Target Audience</label>
              <input
                type="text"
                placeholder="e.g. Tech-savvy millennials in urban areas"
                value={form.target_audience}
                onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            {/* Budget slider */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Monthly Budget</label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <BudgetSlider value={budgetValue} onChange={setBudgetValue} />
              </div>
            </div>

            {/* Ad copy */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Ad Copy</label>
                <span className="text-slate-400 text-xs">{form.ad_copy.length} chars</span>
              </div>
              <textarea
                placeholder="Paste your ad copy here..."
                value={form.ad_copy}
                onChange={e => setForm(f => ({ ...f, ad_copy: e.target.value }))}
                required
                rows={4}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
            </div>

            {/* Image */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">Campaign Image</label>
                <span className="text-slate-400 text-xs">optional</span>
              </div>
              <Dropzone preview={imagePreview} onChange={handleImageChange} />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-gradient-to-br from-indigo-700 to-indigo-900 hover:from-indigo-600 hover:to-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 text-base transition-all duration-200 rounded-xl shadow-[0_12px_30px_-8px_rgba(67,56,202,0.45)] hover:shadow-[0_18px_40px_-8px_rgba(67,56,202,0.6)] hover:-translate-y-0.5 mt-2"
            >
              Run Simulation →
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}
