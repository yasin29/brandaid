import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import DocsPage from '@/pages/app/DocsPage'

export default function StandaloneDocsPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#050508]/90 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm">Brand-AId</span>
            <span className="text-slate-600 text-xs mx-1">/</span>
            <span className="text-slate-400 text-xs">Documentation</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Home
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              Launch App <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </nav>
      <DocsPage />
    </div>
  )
}
