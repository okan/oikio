import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  Settings,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
interface SidebarProps {
  onSearchClick: () => void
}
export function Sidebar({ onSearchClick }: SidebarProps) {
  const location = useLocation()
  const { t } = useTranslation()
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.home') },
    { to: '/persons', icon: Users, label: t('nav.persons') },
    { to: '/meetings', icon: Calendar, label: t('nav.meetings') },
    { to: '/actions', icon: CheckSquare, label: t('nav.actions') },
  ]
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen">
      { }
      <div className="h-10" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />
      { }
      <div className="px-4 pt-1 pb-4">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          oikio
        </h1>
        <p className="text-xs text-slate-400">{t('sidebar.tagline')}</p>
      </div>
      { }
      <div className="px-4 pb-3">
        <button
          onClick={onSearchClick}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>{t('common.search')}</span>
          <kbd className="ml-auto text-xs bg-slate-200 px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
      </div>
      { }
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'text-primary-600')} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
      { }
      <div className="p-4 border-t border-slate-200">
        <NavLink
          to="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            location.pathname === '/settings'
              ? 'text-primary-600 bg-primary-50'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          )}
        >
          <Settings className="w-5 h-5" />
          <span>{t('nav.settings')}</span>
        </NavLink>
      </div>
    </aside>
  )
}
