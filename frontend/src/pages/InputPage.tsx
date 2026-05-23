import { useState } from 'react'
import type { CampaignInput, SimulationResult } from '@/types'
import { runSimulation } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const PLATFORMS = ['Instagram', 'LinkedIn', 'TikTok', 'Facebook', 'Google Ads', 'Twitter/X', 'YouTube']

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
  const [image, setImage] = useState<File | undefined>()
  const [imagePreview, setImagePreview] = useState<string | undefined>()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onSimulationStart()
    try {
      const result = await runSimulation({ ...form, image })
      onSimulationComplete(result)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(109,40,217,0.1)_0%,_transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="objective" className="text-slate-300 text-sm">Campaign Objective</Label>
                <Input
                  id="objective"
                  placeholder="e.g. Increase sign-ups by 20%"
                  value={form.objective}
                  onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="platform" className="text-slate-300 text-sm">Platform</Label>
                <Select value={form.platform} onValueChange={v => setForm(f => ({ ...f, platform: v }))}>
                  <SelectTrigger
                    id="platform"
                    className="bg-white/5 border-white/10 text-white data-[placeholder]:text-slate-600 focus:ring-violet-500/50"
                  >
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141420] border-white/10">
                    {PLATFORMS.map(p => (
                      <SelectItem key={p} value={p} className="text-white focus:bg-white/10 focus:text-white">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="audience" className="text-slate-300 text-sm">Target Audience</Label>
                <Input
                  id="audience"
                  placeholder="e.g. Tech-savvy millennials in urban areas"
                  value={form.target_audience}
                  onChange={e => setForm(f => ({ ...f, target_audience: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="budget" className="text-slate-300 text-sm">Budget</Label>
                <Input
                  id="budget"
                  placeholder="e.g. $500/month"
                  value={form.budget}
                  onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500/50 focus-visible:border-violet-500/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="copy" className="text-slate-300 text-sm">
                  Ad Copy
                  <span className="ml-2 text-slate-600 text-xs font-normal">{form.ad_copy.length} chars</span>
                </Label>
                <Textarea
                  id="copy"
                  placeholder="Paste your ad copy here..."
                  value={form.ad_copy}
                  onChange={e => setForm(f => ({ ...f, ad_copy: e.target.value }))}
                  required
                  rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-violet-500/50 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-300 text-sm">
                  Campaign Image
                  <span className="ml-2 text-slate-600 text-xs font-normal">optional</span>
                </Label>
                <label className="flex items-center justify-center w-full h-24 border border-dashed border-white/10 rounded-lg cursor-pointer bg-white/5 hover:bg-white/[0.07] transition-colors overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <p className="text-slate-500 text-sm">Click to upload</p>
                      <p className="text-slate-600 text-xs">PNG, JPG, WEBP</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <Button
                type="submit"
                disabled={!form.platform}
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
