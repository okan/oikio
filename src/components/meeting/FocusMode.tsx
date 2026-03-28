import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Save,
  Plus,
  Check,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  StickyNote,
  CheckSquare,
} from 'lucide-react'
import type { Meeting, ActionItem, PersonNote, TalkingPoint, MeetingMood } from '@/types'
import { Button, Input, Avatar, RichTextEditor, Modal, Checkbox } from '@/components/ui'
import { MoodSelector } from './MoodSelector'
import { ActionProgressSection } from '@/components/action'
import { formatDate, formatMeetingTitle, getRelativeTime, cn } from '@/lib/utils'

type SidebarTab = 'actions' | 'prep'

interface FocusModeProps {
  meeting: Meeting
  actions: ActionItem[]
  onClose: () => void
  onSaveNotes: (notes: string) => Promise<void>
  onAddAction: (description: string) => Promise<void>
  onToggleAction: (actionId: number) => Promise<void>
  prepPersonNotes?: PersonNote[]
  prepTalkingPoints?: TalkingPoint[]
  prepOtherMeetingActions?: ActionItem[]
  onTogglePrepTalkingPoint?: (id: number) => Promise<void>
  onMoodChange?: (mood: MeetingMood | undefined) => Promise<void>
  onAddProgressNote?: (actionId: number, text: string) => Promise<ActionItem>
}
export function FocusMode({
  meeting,
  actions,
  onClose,
  onSaveNotes,
  onAddAction,
  onToggleAction,
  prepPersonNotes = [],
  prepTalkingPoints = [],
  prepOtherMeetingActions = [],
  onTogglePrepTalkingPoint,
  onMoodChange,
  onAddProgressNote,
}: FocusModeProps) {
  const { t, i18n } = useTranslation()
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('actions')
  const [notes, setNotes] = useState(meeting.notes || '')
  const [newAction, setNewAction] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [localActions, setLocalActions] = useState<ActionItem[]>(actions)
  const [pendingNewActions, setPendingNewActions] = useState<string[]>([])
  const [toggledActionIds, setToggledActionIds] = useState<Set<number>>(new Set())
  const [lastSavedNotes, setLastSavedNotes] = useState(meeting.notes || '')
  const [showAutoSaved, setShowAutoSaved] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hasUnsavedChanges =
    notes !== lastSavedNotes ||
    pendingNewActions.length > 0 ||
    toggledActionIds.size > 0
  const handleSave = useCallback(async (isAutoSave = false) => {
    setIsSaving(true)
    try {
      await onSaveNotes(notes)
      setLastSavedNotes(notes)
      for (const desc of pendingNewActions) {
        await onAddAction(desc)
      }
      for (const actionId of toggledActionIds) {
        if (actionId > 0) {
          await onToggleAction(actionId)
        }
      }
      setPendingNewActions([])
      setToggledActionIds(new Set())
      if (isAutoSave) {
        setShowAutoSaved(true)
        setTimeout(() => setShowAutoSaved(false), 2000)
      }
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }, [notes, pendingNewActions, toggledActionIds, onSaveNotes, onAddAction, onToggleAction])
  const handleSaveAndExit = useCallback(async () => {
    await handleSave(false)
    onClose()
  }, [handleSave, onClose])
  useEffect(() => {
    if (notes !== lastSavedNotes) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true)
      }, 3000)
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [notes, lastSavedNotes, handleSave])
  const handleAddAction = () => {
    if (!newAction.trim()) return
    const description = newAction.trim()
    setPendingNewActions((prev) => [...prev, description])
    const tempAction: ActionItem = {
      id: -Date.now(),
      meetingId: meeting.id,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
    }
    setLocalActions((prev) => [...prev, tempAction])
    setNewAction('')
  }
  const handleToggle = (actionId: number) => {
    setToggledActionIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(actionId)) {
        newSet.delete(actionId)
      } else {
        newSet.add(actionId)
      }
      return newSet
    })
    setLocalActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, completed: !a.completed } : a))
    )
  }
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddAction()
    }
  }
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true)
    } else {
      onClose()
    }
  }, [hasUnsavedChanges, onClose])
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
        return
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (!isSaving) {
          handleSave()
        }
        return
      }
    },
    [handleClose, isSaving, handleSave]
  )
  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleGlobalKeyDown])
  const pendingActions = localActions.filter((a) => !a.completed)
  const completedActions = localActions.filter((a) => a.completed)
  const hasPrepContent =
    prepTalkingPoints.length > 0 ||
    prepPersonNotes.length > 0 ||
    prepOtherMeetingActions.length > 0
  const handlePrepTalkingToggle = async (id: number) => {
    if (!onTogglePrepTalkingPoint) return
    await onTogglePrepTalkingPoint(id)
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-stone-50 z-50 flex flex-col"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-4">
          <Avatar name={meeting.personName || ''} size="md" />
          <div>
            <h1 className="text-lg font-semibold text-stone-900">{formatMeetingTitle(meeting.title, meeting.date)}</h1>
            <div className="flex items-center gap-3 text-sm text-stone-500">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {meeting.personName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(meeting.date, i18n.language)}
              </span>
            </div>
            {onMoodChange && (
              <MoodSelector
                value={meeting.mood}
                onChange={onMoodChange}
                className="mt-3 pt-3 border-t border-stone-100 max-w-xs"
              />
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {showAutoSaved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center gap-1 text-xs text-green-600"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t('focusMode.autoSaved')}
              </motion.span>
            ) : hasUnsavedChanges ? (
              <motion.span
                key="unsaved"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center gap-1 text-xs text-amber-600"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {t('focusMode.unsavedChanges')}
              </motion.span>
            ) : null}
          </AnimatePresence>
          <Button
            variant={hasUnsavedChanges ? 'primary' : 'secondary'}
            onClick={() => handleSave(false)}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {t('common.save')}
          </Button>
          <Button variant="ghost" onClick={handleClose}>
            <X className="w-5 h-5 text-stone-500" />
          </Button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-auto bg-white">
          <h2 className="text-sm font-medium text-stone-500 mb-3">
            {t('focusMode.notes')}
          </h2>
          <RichTextEditor
            value={notes}
            onChange={setNotes}
            placeholder={t('focusMode.notesPlaceholder')}
          />
        </div>
        <div className="w-96 border-l border-stone-200 flex flex-col bg-stone-50 min-h-0">
          <div className="flex shrink-0 border-b border-stone-200 px-2 pt-4">
            <button
              type="button"
              onClick={() => setSidebarTab('actions')}
              className={cn(
                'flex-1 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                sidebarTab === 'actions'
                  ? 'text-stone-900 border-stone-900'
                  : 'text-stone-500 border-transparent hover:text-stone-700'
              )}
            >
              {t('focusMode.actionsTab')}
            </button>
            <button
              type="button"
              onClick={() => setSidebarTab('prep')}
              className={cn(
                'flex-1 pb-3 text-sm font-medium transition-colors border-b-2 -mb-px',
                sidebarTab === 'prep'
                  ? 'text-stone-900 border-stone-900'
                  : 'text-stone-500 border-transparent hover:text-stone-700'
              )}
            >
              {t('focusMode.prepTab')}
            </button>
          </div>
          <div className="flex-1 overflow-auto p-6 min-h-0">
            {sidebarTab === 'actions' ? (
              <>
                <h2 className="text-sm font-medium text-stone-500 mb-3">
                  {t('focusMode.actions')}
                </h2>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={t('focusMode.newActionPlaceholder')}
                    className="flex-1"
                  />
                  <Button onClick={handleAddAction} disabled={!newAction.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {pendingActions.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {pendingActions.map((action) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-start gap-3 p-3 bg-white rounded-lg border ${action.id < 0 ? 'border-amber-300 border-dashed' : 'border-stone-200'
                          }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggle(action.id)}
                          className="mt-0.5 w-5 h-5 rounded border-2 border-stone-300 hover:border-stone-500 transition-colors flex items-center justify-center"
                        >
                          {action.completed && <Check className="w-3 h-3 text-stone-700" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <span className="text-sm text-stone-700 flex-1">{action.description}</span>
                            {action.id < 0 && (
                              <span className="text-xs text-amber-600 shrink-0">{t('focusMode.new')}</span>
                            )}
                          </div>
                          <ActionProgressSection
                            plain
                            progressNotes={action.progressNotes}
                            onAddProgressNote={
                              action.id > 0 && onAddProgressNote
                                ? async (text) => {
                                    const updated = await onAddProgressNote(action.id, text)
                                    setLocalActions((prev) =>
                                      prev.map((a) => (a.id === updated.id ? updated : a))
                                    )
                                  }
                                : undefined
                            }
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                {completedActions.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-stone-400 mb-2">
                      {t('focusMode.completed')} ({completedActions.length})
                    </h3>
                    <div className="space-y-2">
                      {completedActions.map((action) => (
                        <div
                          key={action.id}
                          className={`flex items-start gap-3 p-3 rounded-lg opacity-60 ${action.id < 0 ? 'bg-amber-50 border border-amber-200 border-dashed' : 'bg-stone-100'
                            }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggle(action.id)}
                            className="mt-0.5 w-5 h-5 rounded bg-stone-800 flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm text-stone-500 line-through block">
                              {action.description}
                            </span>
                            <ActionProgressSection
                              plain
                              progressNotes={action.progressNotes}
                              onAddProgressNote={
                                action.id > 0 && onAddProgressNote
                                  ? async (text) => {
                                      const updated = await onAddProgressNote(action.id, text)
                                      setLocalActions((prev) =>
                                        prev.map((a) => (a.id === updated.id ? updated : a))
                                      )
                                    }
                                  : undefined
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {localActions.length === 0 && (
                  <div className="text-center py-8 text-stone-400">
                    <p className="text-sm">{t('focusMode.noActions')}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                {!hasPrepContent ? (
                  <p className="text-sm text-stone-500 text-center py-10">{t('focusMode.noPrepData')}</p>
                ) : (
                  <div className="space-y-6">
                    {prepTalkingPoints.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {t('focusMode.talkingPointsSection')}
                        </h3>
                        <ul className="space-y-2">
                          {prepTalkingPoints.map((tp) => (
                            <li
                              key={tp.id}
                              className="flex items-start gap-2 p-2.5 bg-white rounded-lg border border-stone-200"
                            >
                              {onTogglePrepTalkingPoint ? (
                                <Checkbox
                                  checked={false}
                                  onCheckedChange={() => handlePrepTalkingToggle(tp.id)}
                                  className="mt-0.5"
                                />
                              ) : null}
                              <span className="text-sm text-stone-800 flex-1">{tp.content}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {prepPersonNotes.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <StickyNote className="w-3.5 h-3.5" />
                          {t('focusMode.quickNotesSection')}
                        </h3>
                        <ul className="space-y-2">
                          {prepPersonNotes.map((note) => (
                            <li
                              key={note.id}
                              className="p-2.5 bg-white rounded-lg border border-stone-200 text-sm text-stone-700"
                            >
                              <p className="whitespace-pre-wrap break-words">{note.content}</p>
                              <p className="text-xs text-stone-400 mt-1">
                                {getRelativeTime(note.createdAt, i18n.language)}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {prepOtherMeetingActions.length > 0 && (
                      <div>
                        <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5" />
                          {t('focusMode.previousActions')}
                        </h3>
                        <ul className="space-y-2">
                          {prepOtherMeetingActions.map((action) => (
                            <li
                              key={action.id}
                              className="p-2.5 bg-white rounded-lg border border-stone-200 text-sm text-stone-700"
                            >
                              <p>{action.description}</p>
                              {(action.meetingTitle || action.personName) && (
                                <p className="text-xs text-stone-400 mt-1">
                                  {[action.meetingTitle, action.personName].filter(Boolean).join(' · ')}
                                </p>
                              )}
                              <ActionProgressSection plain progressNotes={action.progressNotes} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="px-6 py-2 border-t border-stone-200 bg-white">
        <div className="flex items-center gap-4 text-xs text-stone-500">
          <span>
            <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded">Esc</kbd>{' '}
            {t('focusMode.exit')}
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded">Enter</kbd>{' '}
            {t('focusMode.addAction')}
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-stone-100 border border-stone-200 rounded">⌘S</kbd>{' '}
            {t('focusMode.saveShortcut')}
          </span>
        </div>
      </div>
      <Modal
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
        title={t('focusMode.exitConfirmTitle')}
        description={t('focusMode.exitConfirmDesc')}
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowExitConfirm(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={onClose}>
            {t('focusMode.discardAndExit')}
          </Button>
          <Button onClick={handleSaveAndExit} isLoading={isSaving}>
            {t('focusMode.saveAndExit')}
          </Button>
        </div>
      </Modal>
    </motion.div>
  )
}
