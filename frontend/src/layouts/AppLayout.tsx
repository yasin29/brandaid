import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, History, LogOut,
  Sparkles, ChevronRight, BookOpen, GraduationCap,
} from 'lucide-react'
import { logout, getUser } from '@/lib/auth'

const NAV = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/new',       icon: PlusCircle,      label: 'New Campaign' },
  { to: '/app/history',   icon: History,         label: 'History' },
  { to: '/app/tutorial',  icon: GraduationCap,   label: 'Tutorial' },
  { to: '/app/docs',      icon: BookOpen,        label: 'Docs' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const user = getUser()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-[#050508] text-white overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-60 flex-none flex flex-col bg-[#08080F] border-r border-white/5">
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-white/5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-none">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Brand-AId</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 flex-none ${isActive ? 'text-indigo-400' : ''}`} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3 h-3 text-indigo-400/60" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center flex-none">
              <span className="text-xs font-semibold text-indigo-300">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">{user?.email ?? 'Admin'}</div>
              <div className="text-[10px] text-slate-500">Workspace Admin</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/8 transition-all"
          >
            <LogOut className="w-4 h-4 flex-none" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
