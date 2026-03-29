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

interface NavbarProps {
  onSearchClick: () => void
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const location = useLocation()
  const { t } = useTranslation()

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.home') },
    { to: '/persons', icon: Users, label: t('nav.persons') },
    { to: '/meetings', icon: Calendar, label: t('nav.meetings') },
    { to: '/actions', icon: CheckSquare, label: t('nav.actions') },
  ]

  return (
    <header className="bg-white border-b border-stone-200 flex-shrink-0">
      <div
        className="h-7"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />
        <div className="grid grid-cols-3 items-center px-8 h-11">
        <div
          className="flex items-center"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <NavLink to="/" className="text-base font-bold text-stone-900 tracking-tight">
            oikio
          </NavLink>
        </div>
        <nav
          className="flex items-center justify-center gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-150',
                  isActive
                    ? 'text-stone-900 bg-stone-100'
                    : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div
          className="flex items-center justify-end gap-1"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <button
            onClick={onSearchClick}
            className="flex items-center gap-2 px-2.5 py-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-md transition-colors"
          >
            <Search className="w-4 h-4" />
            <kbd className="text-[11px] text-stone-400 hidden sm:inline">⌘K</kbd>
          </button>
          <NavLink
            to="/settings"
            className={cn(
              'p-2 rounded-md transition-colors duration-150',
              location.pathname === '/settings'
                ? 'text-stone-900 bg-stone-100'
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
            )}
          >
            <Settings className="w-4 h-4" />
          </NavLink>
        </div>
      </div>
    </header>
  )
}
