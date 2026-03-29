import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { MessageSquare, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { TalkingPoint } from '@/types'
import { talkingPointService } from '@/services'
import { Button, Input, Checkbox, ConfirmModal } from '@/components/ui'
import { cn } from '@/lib/utils'

interface PersonTalkingPointsProps {
  personId: number
}

export function PersonTalkingPoints({ personId }: PersonTalkingPointsProps) {
  const { t } = useTranslation()
  const [items, setItems] = useState<TalkingPoint[]>([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingPointId, setDeletingPointId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await talkingPointService.getByPerson(personId)
      setItems(list)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [personId])

  useEffect(() => {
    load()
  }, [load])

  const openItems = items.filter((tp) => !tp.completed)
  const doneItems = items.filter((tp) => tp.completed)

  const handleAdd = async () => {
    const text = draft.trim()
    if (!text || isSubmitting) return
    setIsSubmitting(true)
    try {
      const created = await talkingPointService.create({ personId, content: text })
      setItems((prev) =>
        [created, ...prev].sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
      )
      setDraft('')
      toast.success(t('talkingPoints.added'))
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (tp: TalkingPoint) => {
    try {
      const updated = await talkingPointService.toggleComplete(tp.id)
      setItems((prev) =>
        prev
          .map((x) => (x.id === updated.id ? updated : x))
          .sort((a, b) => {
            if (a.completed !== b.completed) return a.completed ? 1 : -1
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })
      )
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteClick = (id: number) => {
    setDeletingPointId(id)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (deletingPointId === null) return
    try {
      await talkingPointService.delete(deletingPointId)
      setItems((prev) => prev.filter((tp) => tp.id !== deletingPointId))
      toast.success(t('talkingPoints.deleted'))
    } catch (error) {
      console.error(error)
    } finally {
      setDeleteModalOpen(false)
      setDeletingPointId(null)
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
      <div className="p-4 border-b border-stone-100 bg-violet-50/80">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="w-4 h-4 text-violet-700 shrink-0" />
            <h3 className="font-medium text-violet-950 truncate">{t('talkingPoints.title')}</h3>
          </div>
          {openItems.length > 0 && (
            <span className="text-xs font-medium text-violet-700 tabular-nums shrink-0">
              {t('talkingPoints.openCount', { count: openItems.length })}
            </span>
          )}
        </div>
      </div>
      <div className="p-3 border-b border-stone-100 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('talkingPoints.placeholder')}
          className="flex-1"
        />
        <Button type="button" onClick={handleAdd} disabled={!draft.trim() || isSubmitting} isLoading={isSubmitting}>
          {t('common.add')}
        </Button>
      </div>
      <div className="min-h-[4rem]">
        {isLoading ? (
          <p className="p-4 text-sm text-stone-500 text-center">{t('common.loading')}</p>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-stone-500 text-center">{t('talkingPoints.empty')}</p>
        ) : (
          <div>
            {openItems.length > 0 && (
              <ul className="divide-y divide-stone-100">
                {openItems.map((tp, index) => (
                  <motion.li
                    key={tp.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group flex items-start gap-3 p-3 hover:bg-stone-50/80"
                  >
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => handleToggle(tp)}
                      className="mt-0.5"
                    />
                    <p className="flex-1 min-w-0 text-sm text-stone-800 whitespace-pre-wrap break-words pt-0.5">
                      {tp.content}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(tp.id)}
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
            {doneItems.length > 0 && (
              <div className="border-t border-stone-100 bg-stone-50/50">
                <p className="px-3 py-2 text-xs font-medium text-stone-400">{t('talkingPoints.completed')}</p>
                <ul className="divide-y divide-stone-100">
                  {doneItems.map((tp) => (
                    <li
                      key={tp.id}
                      className="group flex items-start gap-3 p-3 hover:bg-stone-50/80"
                    >
                      <Checkbox
                        checked
                        onCheckedChange={() => handleToggle(tp)}
                        className="mt-0.5"
                      />
                      <p className="flex-1 min-w-0 text-sm text-stone-500 line-through whitespace-pre-wrap break-words pt-0.5">
                        {tp.content}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(tp.id)}
                        className={cn(
                          'shrink-0 p-1.5 rounded-md text-stone-400 hover:text-red-600 hover:bg-red-50',
                          'opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity'
                        )}
                        aria-label={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open)
          if (!open) setDeletingPointId(null)
        }}
        title={t('common.delete')}
        description={t('talkingPoints.deleteConfirm')}
        onConfirm={handleDeleteConfirm}
      />
    </motion.div>
  )
}
