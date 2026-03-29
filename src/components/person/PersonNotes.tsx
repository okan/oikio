import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { StickyNote, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { PersonNote } from '@/types'
import { personNoteService } from '@/services'
import { Button, Input, ConfirmModal } from '@/components/ui'
import { getRelativeTime, cn } from '@/lib/utils'

interface PersonNotesProps {
  personId: number
}

export function PersonNotes({ personId }: PersonNotesProps) {
  const { t, i18n } = useTranslation()
  const [notes, setNotes] = useState<PersonNote[]>([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await personNoteService.getByPerson(personId)
      setNotes(list)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [personId])

  useEffect(() => {
    load()
  }, [load])

  const handleAdd = async () => {
    const text = draft.trim()
    if (!text || isSubmitting) return
    setIsSubmitting(true)
    try {
      const created = await personNoteService.create({ personId, content: text })
      setNotes((prev) => [created, ...prev])
      setDraft('')
      toast.success(t('personNotes.added'))
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeletingNoteId(id)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deletingNoteId === null) return
    try {
      await personNoteService.delete(deletingNoteId)
      setNotes((prev) => prev.filter((n) => n.id !== deletingNoteId))
      toast.success(t('personNotes.deleted'))
    } catch (error) {
      console.error(error)
    } finally {
      setDeleteModalOpen(false)
      setDeletingNoteId(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="p-4 border-b border-stone-100 bg-stone-50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <StickyNote className="w-4 h-4 text-stone-600 shrink-0" />
            <h3 className="font-medium text-stone-900 truncate">{t('personNotes.title')}</h3>
          </div>
          {notes.length > 0 && (
            <span className="text-xs font-medium text-stone-500 tabular-nums shrink-0">
              {notes.length}
            </span>
          )}
        </div>
      </div>
      <div className="p-3 border-b border-stone-100 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('personNotes.placeholder')}
          className="flex-1"
        />
        <Button type="button" onClick={handleAdd} disabled={!draft.trim() || isSubmitting} isLoading={isSubmitting}>
          {t('common.add')}
        </Button>
      </div>
      <div className="min-h-[4rem]">
        {isLoading ? (
          <p className="p-4 text-sm text-stone-500 text-center">{t('common.loading')}</p>
        ) : notes.length === 0 ? (
          <p className="p-4 text-sm text-stone-500 text-center">{t('personNotes.empty')}</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {notes.map((note, index) => (
              <motion.li
                key={note.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="group flex gap-3 p-3 hover:bg-stone-50/80"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-stone-800 whitespace-pre-wrap break-words">{note.content}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    {getRelativeTime(note.createdAt, i18n.language)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(note.id)}
                  className={cn(
                    'shrink-0 p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50',
                    'opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity'
                  )}
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open)
          if (!open) setDeletingNoteId(null)
        }}
        title={t('common.delete')}
        description={t('personNotes.deleteConfirm')}
        onConfirm={handleDeleteConfirm}
      />
    </motion.div>
  )
}
