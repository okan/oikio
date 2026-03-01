import { useState, useEffect, useCallback } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { SearchModal } from './SearchModal'
import { QuickActionModal } from './QuickActionModal'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'

const SIDEBAR_STORAGE_KEY = 'oikio-sidebar-collapsed'

export function Layout() {
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  })

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next))
      return next
    })
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault()
        setQuickActionOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'n') {
        e.preventDefault()
        navigate('/meetings?new=true')
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault()
        navigate('/persons?new=true')
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShortcutsHelpOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate, toggleSidebar])
  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onSearchClick={() => setSearchOpen(true)}
      />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <Outlet />
        </div>
      </main>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <QuickActionModal open={quickActionOpen} onOpenChange={setQuickActionOpen} />
      <KeyboardShortcutsHelp open={shortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen} />
    </div>
  )
}
