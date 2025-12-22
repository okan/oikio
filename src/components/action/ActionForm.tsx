import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button, Input, TagInput } from '@/components/ui'
import { toInputDate, cn } from '@/lib/utils'
import { actionService } from '@/services'

interface ActionFormProps {
  onSubmit: (data: { description: string; tags?: string[]; dueDate?: string; assignedTo?: 'me' | 'other' }) => Promise<void>
}

export function ActionForm({ onSubmit }: ActionFormProps) {
  const { t } = useTranslation()
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [dueDate, setDueDate] = useState('')
  const [assignedTo, setAssignedTo] = useState<'me' | 'other'>('me')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [allTags, setAllTags] = useState<string[]>([])

  
  useEffect(() => {
    if (isExpanded) {
      actionService.getAllTags().then(setAllTags).catch(console.error)
    }
  }, [isExpanded])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit({
        description: description.trim(),
        tags: tags.length > 0 ? tags : undefined,
        dueDate: dueDate || undefined,
        assignedTo,
      })
      setDescription('')
      setTags([])
      setDueDate('')
      setAssignedTo('me')
      setIsExpanded(false)
    } catch (error) {
      console.error('Error creating action:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full p-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:border-slate-300 hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        {t('actions.addAction')}
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <Input
        placeholder={t('actions.descriptionPlaceholder')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        autoFocus
      />
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-slate-500 px-1">
          {t('actions.assignedTo')}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAssignedTo('me')}
            className={cn(
              'flex-1 py-1.5 px-3 text-xs font-medium rounded-md border transition-colors',
              assignedTo === 'me'
                ? 'bg-primary-600 border-primary-600 text-white'
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
                ? 'bg-amber-600 border-amber-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            {t('actions.other')}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TagInput
          value={tags}
          onChange={setTags}
          suggestions={allTags}
          placeholder={t('tags.placeholder')}
        />
        <Input
          type="date"
          placeholder={t('actions.dueDate')}
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          min={toInputDate(new Date())}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setIsExpanded(false)}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={!description.trim()}>
          {t('common.add')}
        </Button>
      </div>
    </form>
  )
}

