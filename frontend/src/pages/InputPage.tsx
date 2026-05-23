import { useState } from 'react'
import type { CampaignInput, SimulationResult } from '@/types'
import { runSimulation } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// ── Platform tiles ────────────────────────────────────────────────────────────

const PLATFORMS = [
  { name: 'Instagram',   color: '#E1306C', emoji: '📸' },
  { name: 'LinkedIn',    color: '#0A66C2', emoji: '💼' },
  { name: 'TikTok',      color: '#EE1D52', emoji: '🎵' },
  { name: 'Facebook',    color: '#1877F2', emoji: '👍' },
  { name: 'Google Ads',  color: '#4285F4', emoji: '🔍' },
  { name: 'Twitter/X',   color: '#14171A', emoji: '✕' },
  { name: 'YouTube',     color: '#FF0000', emoji: '▶' },
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
                ? 'border-violet-500 bg-violet-950/40 shadow-[0_0_16px_rgba(124,58,237,0.2)]'
                : 'border-white/8 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
              }`}
          >
            {/* color stripe */}
            <div
              className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ backgroundColor: p.color, opacity: isSelected ? 1 : 0.4 }}
            />
            <span className="text-lg leading-none">{p.emoji}</span>
            <span className={`text-[11px] font-medium text-center leading-tight ${isSelected ? 'text-white' : 'text-slate-400'}`}>
              {p.name}
            </span>
            {isSelected && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-violet-600 rounded-full flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">✓</span>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ── Budget slider ─────────────────────────────────────────────────────────────

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
    <div className="space-y-3">
      {/* Value display */}
      <div className="text-center">
        <span className="text-3xl font-black text-white tabular-nums">
          {value >= 1000 ? `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K` : `$${value}`}
        </span>
        <span className="text-slate-500 text-sm ml-1">/month</span>
      </div>

      {/* Slider */}
      <div className="relative h-2 bg-white/8 rounded-full">
        <div
          className="absolute left-0 top-0 h-full bg-violet-600 rounded-full"
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
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-violet-600 rounded-full shadow-[0_0_8px_rgba(124,58,237,0.4)] pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)` }}
        />
      </div>

      {/* Presets */}
      <div className="flex gap-1.5 flex-wrap">
        {BUDGET_PRESETS.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-150
              ${value === p
                ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300'
              }`}
          >
            {formatBudget(p)}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Dropzone ──────────────────────────────────────────────────────────────────

function Dropzone({
  preview,
  onChange,
}: { preview: string | undefined; onChange: (f: File) => void }) {
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File | undefined) => {
    if (file && file.type.startsWith('image/')) {
      onChange(file)
    }
  }

  return (
    <label
      className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 overflow-hidden
        ${dragging ? 'border-violet-500 bg-violet-950/30' : 'border-white/10 bg-white/[0.03] hover:border-violet-500/40 hover:bg-white/[0.05]'}`}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
    >
      {preview ? (
        <img src={preview} alt="Preview" className="h-full w-full object-cover" />
      ) : (
        <div className="text-center select-none">
          <div className={`text-2xl mb-1 transition-transform duration-700 ${dragging ? 'translate-y-[-4px]' : 'animate-bounce'}`}
            style={{ animationDuration: '2s' }}>
            ⬆
          </div>
          <p className="text-slate-500 text-sm font-medium">Drop image or click to upload</p>
          <p className="text-slate-600 text-xs mt-0.5">PNG · JPG · WEBP</p>
        </div>
      )}
      <input type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
    </label>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  onSimulationStart: () => void
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
    onSimulationStart()
    try {
      const result = await runSimulation(campaignData)
      onSimulationComplete(result)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const canSubmit = form.objective && form.platform && form.target_audience && form.ad_copy

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(109,40,217,0.1)_0%,_transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-violet-950/50 border border-violet-700/30 text-violet-400 text-xs font-medium px-3 py-1 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            AI Campaign Simulation Engine
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight mb-2">Brand-AId</h1>
          <p className="text-slate-400 text-sm">Test your campaign against a synthetic market before launch.</p>
        </div>

        <Card className="bg-white/[0.03] border border-white/10 shadow-2xl backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Objective */}
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Campaign Objective</Label>
                <Input
                  placeholder="e.g. Increase sign-ups by 20%"
                  value={form.objective}
                  onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
                />
              </div>

              {/* Platform tiles */}
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Platform</Label>
                <PlatformGrid selected={form.platform} onChange={v => setForm(f => ({ ...f, platform: v }))} />
              </div>

              {/* Audience */}
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Target Audience</Label>
                <Input
                  placeholder="e.g. Tech-savvy millennials in urban areas"
                  value={form.target_audience}
                  onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
                />
              </div>

              {/* Budget slider */}
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">Monthly Budget</Label>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <BudgetSlider value={budgetValue} onChange={setBudgetValue} />
                </div>
              </div>

              {/* Ad copy */}
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">
                  Ad Copy
                  <span className="ml-2 text-slate-600 text-xs font-normal">{form.ad_copy.length} chars</span>
                </Label>
                <Textarea
                  placeholder="Paste your ad copy here..."
                  value={form.ad_copy}
                  onChange={e => setForm(f => ({ ...f, ad_copy: e.target.value }))}
                  required
                  rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500/50 resize-none"
                />
              </div>

              {/* Image dropzone */}
              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">
                  Campaign Image
                  <span className="ml-2 text-slate-600 text-xs font-normal">optional</span>
                </Label>
                <Dropzone preview={imagePreview} onChange={handleImageChange} />
              </div>

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold py-5 text-base transition-all duration-200 shadow-[0_0_24px_rgba(109,40,217,0.25)] hover:shadow-[0_0_32px_rgba(109,40,217,0.45)] mt-2"
              >
                Run Simulation →
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
