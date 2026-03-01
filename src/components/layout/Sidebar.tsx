import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  Settings,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onSearchClick: () => void
}

export function Sidebar({ collapsed, onToggle, onSearchClick }: SidebarProps) {
  const location = useLocation()
  const { t } = useTranslation()

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: t('nav.home') },
    { to: '/persons', icon: Users, label: t('nav.persons') },
    { to: '/meetings', icon: Calendar, label: t('nav.meetings') },
    { to: '/actions', icon: CheckSquare, label: t('nav.actions') },
  ]

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-white border-r border-stone-200 flex flex-col h-screen overflow-hidden flex-shrink-0"
    >
      <div className="h-10" style={{ WebkitAppRegion: 'drag' } as React.CSSProperties} />

      <div className={cn('px-4 pt-1 flex items-center', collapsed ? 'justify-center pb-3' : 'justify-between pb-4')}>
        {collapsed ? (
          <span className="text-lg font-bold text-stone-900">o</span>
        ) : (
          <div>
            <h1 className="text-lg font-bold text-stone-900 tracking-tight">oikio</h1>
            <p className="text-[11px] text-stone-400">{t('sidebar.tagline')}</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors',
            collapsed && 'hidden'
          )}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {!collapsed && (
        <div className="px-3 pb-3">
          <button
            onClick={onSearchClick}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-stone-400 bg-stone-50 border border-stone-100 rounded-lg hover:bg-stone-100 hover:border-stone-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t('common.search')}</span>
            <kbd className="ml-auto text-[11px] text-stone-400">⌘K</kbd>
          </button>
        </div>
      )}

      {collapsed && (
        <div className="px-2 pb-2">
          <button
            onClick={onSearchClick}
            className="w-full flex items-center justify-center p-2 text-stone-400 rounded-lg hover:bg-stone-100 transition-colors"
            title={t('common.search')}
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      )}

      <nav className={cn('flex-1 space-y-0.5 overflow-y-auto', collapsed ? 'px-2 py-1' : 'px-3 py-1')}>
        {navItems.map((item) => {
          const isActive =
            item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center rounded-lg text-[13px] font-medium transition-colors duration-150',
                collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2',
                isActive
                  ? 'text-stone-900 bg-stone-100'
                  : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
              )}
            >
              <item.icon className={cn('w-[18px] h-[18px] flex-shrink-0', isActive && 'text-stone-900')} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className={cn('border-t border-stone-100', collapsed ? 'p-2' : 'p-3')}>
        {collapsed && (
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-center p-2.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors mb-1"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-[18px] h-[18px]" />
          </button>
        )}
        <NavLink
          to="/settings"
          title={collapsed ? t('nav.settings') : undefined}
          className={cn(
            'flex items-center rounded-lg text-[13px] font-medium transition-colors duration-150',
            collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2',
            location.pathname === '/settings'
              ? 'text-stone-900 bg-stone-100'
              : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
          )}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>{t('nav.settings')}</span>}
        </NavLink>
      </div>
    </motion.aside>
  )
}
