import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import * as Dialog from '@radix-ui/react-dialog'
import { Search, User, Calendar, X } from 'lucide-react'
import type { Person, Meeting } from '@/types'
import { formatDateShort, formatMeetingTitle } from '@/lib/utils'
interface SearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ persons: Person[]; meetings: Meeting[] }>({
    persons: [],
    meetings: [],
  })
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const resultsRef = useRef<HTMLDivElement>(null)
  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults({ persons: [], meetings: [] })
      return
    }
    setIsSearching(true)
    try {
      const data = await window.api.search(searchQuery)
      setResults(data)
      setSelectedIndex(0)  
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])
  useEffect(() => {
    const debounce = setTimeout(() => {
      search(query)
    }, 300)
    return () => clearTimeout(debounce)
  }, [query, search])
  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults({ persons: [], meetings: [] })
      setSelectedIndex(0)
    }
  }, [open])
  const handleSelect = (type: 'person' | 'meeting', id: number) => {
    onOpenChange(false)
    if (type === 'person') {
      navigate(`/persons/${id}`)
    } else {
      navigate(`/meetings/${id}`)
    }
  }
  const getAllItems = () => {
    return [
      ...results.persons.map((p) => ({ type: 'person' as const, data: p })),
      ...results.meetings.map((m) => ({ type: 'meeting' as const, data: m })),
    ]
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = getAllItems()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = items[selectedIndex]
      if (selected) {
        handleSelect(selected.type, selected.data.id)
      }
    }
  }
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])
  const hasResults = results.persons.length > 0 || results.meetings.length > 0
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content
          className="fixed left-1/2 top-[15%] -translate-x-1/2 z-50 w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden focus:outline-none data-[state=open]:animate-search-in data-[state=closed]:animate-search-out"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          { }
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
              autoFocus
            />
            <Dialog.Close asChild>
              <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>
          { }
          <div className="max-h-[400px] overflow-y-auto" ref={resultsRef}>
            {isSearching ? (
              <div className="p-8 text-center text-slate-500">{t('common.loading')}</div>
            ) : query.length >= 2 && !hasResults ? (
              <div className="p-8 text-center text-slate-500">{t('common.noResults')}</div>
            ) : hasResults ? (
              <div className="p-2">
                {results.persons.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-1.5 text-xs font-medium text-slate-500 uppercase">
                      {t('search.people')}
                    </div>
                    {results.persons.map((person, index) => {
                      const absoluteIndex = index
                      const isSelected = selectedIndex === absoluteIndex
                      return (
                        <button
                          key={person.id}
                          data-index={absoluteIndex}
                          onClick={() => handleSelect('person', person.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${isSelected ? 'bg-primary-50' : 'hover:bg-slate-100'
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${isSelected ? 'text-primary-900' : 'text-slate-900'}`}>
                              {person.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {person.role === 'manager' ? t('persons.manager') : t('persons.teammate')}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
                {results.meetings.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-xs font-medium text-slate-500 uppercase">
                      {t('search.meetings')}
                    </div>
                    {results.meetings.map((meeting, index) => {
                      const absoluteIndex = results.persons.length + index
                      const isSelected = selectedIndex === absoluteIndex
                      return (
                        <button
                          key={meeting.id}
                          data-index={absoluteIndex}
                          onClick={() => handleSelect('meeting', meeting.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${isSelected ? 'bg-primary-50' : 'hover:bg-slate-100'
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${isSelected ? 'text-primary-900' : 'text-slate-900'}`}>
                              {formatMeetingTitle(meeting.title, meeting.date)}
                            </div>
                            <div className="text-xs text-slate-500">
                              {meeting.personName} • {formatDateShort(meeting.date)}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                {t('search.minChars')}
              </div>
            )}
          </div>
          { }
          <div className="px-4 py-2 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>
                <kbd className="px-1.5 py-0.5 bg-slate-200 rounded">↑↓</kbd> {t('search.navigate')}
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-slate-200 rounded">Enter</kbd> {t('search.select')}
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 bg-slate-200 rounded">Esc</kbd> {t('search.close')}
              </span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
