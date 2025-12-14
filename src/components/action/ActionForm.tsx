import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { toInputDate } from '@/lib/utils'
interface ActionFormProps {
  onSubmit: (data: { description: string; assignee?: string; dueDate?: string }) => Promise<void>
}
export function ActionForm({ onSubmit }: ActionFormProps) {
  const { t } = useTranslation()
  const [description, setDescription] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    setIsSubmitting(true)
    try {
      await onSubmit({
        description: description.trim(),
        assignee: assignee.trim() || undefined,
        dueDate: dueDate || undefined,
      })
      setDescription('')
      setAssignee('')
      setDueDate('')
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
        className="w-full p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
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
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder={t('actions.assigneePlaceholder')}
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
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
