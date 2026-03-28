import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown } from 'lucide-react'
import type { ActionProgressNote } from '@/types'
import { Button, Textarea } from '@/components/ui'
import { cn, formatDate } from '@/lib/utils'

interface ActionProgressSectionProps {
  progressNotes?: ActionProgressNote[]
  onAddProgressNote?: (text: string) => Promise<void>
  plain?: boolean
}
export function ActionProgressSection({
  progressNotes = [],
  onAddProgressNote,
  plain,
}: ActionProgressSectionProps) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const hasNotes = progressNotes.length > 0
  const canAdd = !!onAddProgressNote
  if (!hasNotes && !canAdd) return null
  const sorted = [...progressNotes].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const handleAdd = async () => {
    const text = draft.trim()
    if (!text || !onAddProgressNote) return
    setSubmitting(true)
    try {
      await onAddProgressNote(text)
      setDraft('')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className={cn('mt-2', plain && 'mt-1.5')}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={cn(
          'flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 transition-colors',
          plain && 'text-[11px]'
        )}
        aria-expanded={open}
        aria-label={open ? t('actions.progressCollapse') : t('actions.progressExpand')}
      >
        <ChevronDown
          className={cn('w-3.5 h-3.5 transition-transform shrink-0', open && 'rotate-180')}
        />
        <span>
          {t('actions.progressUpdates')}
          {hasNotes ? ` (${progressNotes.length})` : ''}
        </span>
      </button>
      {open && (
        <div
          className={cn(
            'mt-2 space-y-2 pl-1 border-l-2 border-stone-200',
            plain && 'border-stone-100'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {sorted.map((note) => (
            <div key={note.id} className="pl-2">
              <p className="text-[10px] text-stone-400 mb-0.5">
                {formatDate(note.createdAt, i18n.language, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className={cn('text-sm text-stone-700 whitespace-pre-wrap', plain && 'text-xs')}>
                {note.text}
              </p>
            </div>
          ))}
          {canAdd && (
            <div className="pl-2 space-y-2 pt-1">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('actions.addProgressPlaceholder')}
                rows={plain ? 2 : 3}
                className={cn('text-sm', plain && 'text-xs min-h-[3rem]')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    void handleAdd()
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!draft.trim() || submitting}
                isLoading={submitting}
                onClick={() => void handleAdd()}
              >
                {t('actions.addProgress')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
