import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Navbar } from './Navbar'
import { SearchModal } from './SearchModal'
import { QuickActionModal } from './QuickActionModal'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'

export function Layout() {
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }
      const key = e.key.toLowerCase()
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && key === 'a') {
        e.preventDefault()
        setQuickActionOpen(true)
      }
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && key === 'n') {
        e.preventDefault()
        navigate('/meetings?new=true')
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && key === 'n') {
        e.preventDefault()
        navigate('/persons?new=true')
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setShortcutsHelpOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate])
  return (
    <div className="flex flex-col h-screen bg-stone-50">
      <Navbar onSearchClick={() => setSearchOpen(true)} />
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
