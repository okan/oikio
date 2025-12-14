import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { X, Save, Plus, Check, Clock, User, AlertCircle } from 'lucide-react'
import type { Meeting, ActionItem } from '@/types'
import { Button, Input, Avatar, RichTextEditor } from '@/components/ui'
import { formatDate, formatMeetingTitle } from '@/lib/utils'
interface FocusModeProps {
  meeting: Meeting
  actions: ActionItem[]
  onClose: () => void
  onSaveNotes: (notes: string) => Promise<void>
  onAddAction: (description: string) => Promise<void>
  onToggleAction: (actionId: number) => Promise<void>
}
export function FocusMode({
  meeting,
  actions,
  onClose,
  onSaveNotes,
  onAddAction,
  onToggleAction,
}: FocusModeProps) {
  const { t } = useTranslation()
  const [notes, setNotes] = useState(meeting.notes || '')
  const [newAction, setNewAction] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [localActions, setLocalActions] = useState<ActionItem[]>(actions)
  const [pendingNewActions, setPendingNewActions] = useState<string[]>([])
  const [toggledActionIds, setToggledActionIds] = useState<Set<number>>(new Set())
  const hasUnsavedChanges =
    notes !== (meeting.notes || '') ||
    pendingNewActions.length > 0 ||
    toggledActionIds.size > 0
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSaveNotes(notes)
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
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }, [notes, pendingNewActions, toggledActionIds, onSaveNotes, onAddAction, onToggleAction])
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
  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
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
    [onClose, isSaving, handleSave]
  )
  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [handleGlobalKeyDown])
  const pendingActions = localActions.filter((a) => !a.completed)
  const completedActions = localActions.filter((a) => a.completed)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-50 z-50 flex flex-col"
    >
      { }
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <Avatar name={meeting.personName || ''} size="md" />
          <div>
            <h1 className="text-lg font-semibold text-slate-900">{formatMeetingTitle(meeting.title, meeting.date)}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {meeting.personName}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDate(meeting.date)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle className="w-3.5 h-3.5" />
              {t('focusMode.unsavedChanges')}
            </span>
          )}
          <Button
            variant={hasUnsavedChanges ? 'primary' : 'secondary'}
            onClick={handleSave}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            {t('common.save')}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5 text-slate-500" />
          </Button>
        </div>
      </div>
      { }
      <div className="flex-1 flex overflow-hidden">
        { }
        <div className="flex-1 p-6 overflow-auto bg-white">
          <h2 className="text-sm font-medium text-slate-500 mb-3">
            {t('focusMode.notes')}
          </h2>
          <RichTextEditor
            value={notes}
            onChange={setNotes}
            placeholder={t('focusMode.notesPlaceholder')}
          />
        </div>
        { }
        <div className="w-96 border-l border-slate-200 p-6 overflow-auto bg-slate-50">
          <h2 className="text-sm font-medium text-slate-500 mb-3">
            {t('focusMode.actions')}
          </h2>
          { }
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
          { }
          {pendingActions.length > 0 && (
            <div className="space-y-2 mb-4">
              {pendingActions.map((action) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-start gap-3 p-3 bg-white rounded-lg border ${
                    action.id < 0 ? 'border-amber-300 border-dashed' : 'border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => handleToggle(action.id)}
                    className="mt-0.5 w-5 h-5 rounded border-2 border-slate-300 hover:border-primary-500 transition-colors flex items-center justify-center"
                  >
                    {action.completed && <Check className="w-3 h-3 text-primary-500" />}
                  </button>
                  <span className="text-sm text-slate-700">{action.description}</span>
                  {action.id < 0 && (
                    <span className="ml-auto text-xs text-amber-600">{t('focusMode.new')}</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          { }
          {completedActions.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-slate-400 mb-2">
                {t('focusMode.completed')} ({completedActions.length})
              </h3>
              <div className="space-y-2">
                {completedActions.map((action) => (
                  <div
                    key={action.id}
                    className={`flex items-start gap-3 p-3 rounded-lg opacity-60 ${
                      action.id < 0 ? 'bg-amber-50 border border-amber-200 border-dashed' : 'bg-slate-100'
                    }`}
                  >
                    <button
                      onClick={() => handleToggle(action.id)}
                      className="mt-0.5 w-5 h-5 rounded bg-primary-500 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </button>
                    <span className="text-sm text-slate-500 line-through">
                      {action.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {localActions.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <p className="text-sm">{t('focusMode.noActions')}</p>
            </div>
          )}
        </div>
      </div>
      { }
      <div className="px-6 py-2 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">Esc</kbd>{' '}
            {t('focusMode.exit')}
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">Enter</kbd>{' '}
            {t('focusMode.addAction')}
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">⌘S</kbd>{' '}
            {t('focusMode.saveShortcut')}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
