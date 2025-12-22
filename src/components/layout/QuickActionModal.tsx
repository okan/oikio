import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import * as Dialog from '@radix-ui/react-dialog'
import { Zap, X, Calendar } from 'lucide-react'
import type { Person, Meeting } from '@/types'
import { Button, Input, Select, Textarea } from '@/components/ui'
import { cn } from '@/lib/utils'
interface QuickActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
export function QuickActionModal({ open, onOpenChange }: QuickActionModalProps) {
  const { t } = useTranslation()
  const [description, setDescription] = useState('')
  const [personId, setPersonId] = useState('')
  const [meetingId, setMeetingId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState<'me' | 'other'>('me')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [persons, setPersons] = useState<Person[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  useEffect(() => {
    if (open) {
      const loadData = async () => {
        const allPersons = await window.api.persons.getAll()
        setPersons(allPersons)
      }
      loadData()
    }
  }, [open])
  useEffect(() => {
    if (personId) {
      const loadMeetings = async () => {
        const personMeetings = await window.api.meetings.getByPerson(parseInt(personId))
        setMeetings(personMeetings.slice(0, 5))
      }
      loadMeetings()
    } else {
      setMeetings([])
      setMeetingId('')
    }
  }, [personId])
  useEffect(() => {
    if (!open) {
      setDescription('')
      setPersonId('')
      setMeetingId('')
      setDueDate('')
      setAssignedTo('me')
    }
  }, [open])
  const handleQuickDueDate = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setDueDate(date.toISOString().split('T')[0])
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || !meetingId) return
    setIsSubmitting(true)
    try {
      await window.api.actions.create({
        meetingId: parseInt(meetingId),
        description: description.trim(),
        dueDate: dueDate || undefined,
        assignedTo,
        completed: false,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating action:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  const personOptions = persons.map((p) => ({
    value: p.id.toString(),
    label: p.name,
  }))
  const meetingOptions = meetings.map((m) => {
    const title = m.title && m.title !== 'undefined' ? m.title : t('meetings.untitled');
    return {
      value: m.id.toString(),
      label: `${title} (${new Date(m.date).toLocaleDateString()})`,
    };
  })
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content className="fixed left-1/2 top-[15%] -translate-x-1/2 z-50 w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden focus:outline-none data-[state=open]:animate-search-in data-[state=closed]:animate-search-out">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-600" />
              <Dialog.Title className="font-semibold text-slate-900">
                {t('quickAction.title')}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('quickAction.descriptionPlaceholder')}
              rows={2}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label={t('meetings.person')}
                placeholder={t('meetings.selectPerson')}
                value={personId}
                onValueChange={setPersonId}
                options={personOptions}
              />
              <Select
                label={t('quickAction.meeting')}
                placeholder={t('quickAction.selectMeeting')}
                value={meetingId}
                onValueChange={setMeetingId}
                options={meetingOptions}
                disabled={!personId || meetings.length === 0}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">
                {t('actions.assignedTo')}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAssignedTo('me')}
                  className={cn(
                    'flex-1 py-1.5 px-3 text-xs font-medium rounded-md border transition-colors',
                    assignedTo === 'me'
                      ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {t('actions.me')}
                </button>
                <button
                  type="button"
                  onClick={() => setAssignedTo('other')}
                  className={cn(
                    'flex-1 py-1.5 px-3 text-xs font-medium rounded-md border transition-colors',
                    assignedTo === 'other'
                      ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {t('actions.other')}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('actions.dueDate')}
              </label>
              <div className="flex gap-2 mb-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickDueDate(0)}
                  className="flex-1"
                >
                  {t('quickAction.today')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickDueDate(1)}
                  className="flex-1"
                >
                  {t('quickAction.tomorrow')}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleQuickDueDate(7)}
                  className="flex-1"
                >
                  {t('quickAction.nextWeek')}
                </Button>
              </div>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!description.trim() || !meetingId}
              >
                {t('common.add')}
              </Button>
            </div>
          </form>
          <div className="px-4 py-2 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span>
                <kbd className="px-1.5 py-0.5 bg-slate-200 rounded">⌘⇧A</kbd> {t('quickAction.shortcut')}
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
