import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Person, PersonRole, MeetingFrequency } from '@/types'
import { Button, Input, Select, Modal } from '@/components/ui'
import { cn } from '@/lib/utils'
interface PersonFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person?: Person | null
  onSubmit: (data: Omit<Person, 'id' | 'createdAt'>) => Promise<void>
}
export function PersonForm({ open, onOpenChange, person, onSubmit }: PersonFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [role, setRole] = useState<PersonRole>('teammate')
  const [meetingFrequencyGoal, setMeetingFrequencyGoal] = useState<MeetingFrequency | ''>('')
  const [jobTitle, setJobTitle] = useState('')
  const [goals, setGoals] = useState('')
  const [notes, setNotes] = useState('')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const roleOptions = [
    { value: 'manager', label: t('persons.manager') },
    { value: 'teammate', label: t('persons.teammate') },
  ]
  const frequencyOptions = [
    { value: '', label: t('persons.noFrequencyGoal') },
    { value: 'weekly', label: t('persons.weekly') },
    { value: 'biweekly', label: t('persons.biweekly') },
    { value: 'monthly', label: t('persons.monthly') },
    { value: 'quarterly', label: t('persons.quarterly') },
  ]
  useEffect(() => {
    if (person) {
      setName(person.name)
      setRole(person.role)
      setMeetingFrequencyGoal(person.meetingFrequencyGoal || '')
      setJobTitle(person.title || '')
      setGoals(person.goals || '')
      setNotes(person.notes || '')
      const hasDetails = Boolean(person.title?.trim() || person.goals?.trim() || person.notes?.trim())
      setDetailsOpen(hasDetails)
    } else {
      setName('')
      setRole('teammate')
      setMeetingFrequencyGoal('')
      setJobTitle('')
      setGoals('')
      setNotes('')
      setDetailsOpen(false)
    }
    setErrors({})
  }, [person, open])
  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = t('common.required', { field: t('persons.name') })
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        role,
        meetingFrequencyGoal: meetingFrequencyGoal || undefined,
        title: jobTitle.trim(),
        goals: goals.trim(),
        notes: notes.trim(),
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving person:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={person ? t('persons.editPerson') : t('persons.addPerson')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('persons.name')}
          placeholder={t('persons.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('persons.role')}
            value={role}
            onValueChange={(value) => setRole(value as PersonRole)}
            options={roleOptions}
          />
          <Select
            label={t('persons.meetingFrequency')}
            value={meetingFrequencyGoal}
            onValueChange={(value) => setMeetingFrequencyGoal(value as MeetingFrequency | '')}
            options={frequencyOptions}
          />
        </div>
        <div className="border border-stone-200 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setDetailsOpen((v) => !v)}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 transition-colors"
          >
            {detailsOpen ? (
              <ChevronDown className="w-4 h-4 shrink-0 text-stone-500" />
            ) : (
              <ChevronRight className="w-4 h-4 shrink-0 text-stone-500" />
            )}
            {t('persons.details')}
          </button>
          <div className={cn('px-3 pb-3 pt-1 space-y-4 border-t border-stone-100', !detailsOpen && 'hidden')}>
            <Input
              label={t('persons.jobTitle')}
              placeholder={t('persons.jobTitlePlaceholder')}
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
            />
            <div className="space-y-2">
              <label htmlFor="person-form-goals" className="label">
                {t('persons.goals')}
              </label>
              <textarea
                id="person-form-goals"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder={t('persons.goalsPlaceholder')}
                rows={3}
                className="input min-h-[5rem] resize-y"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="person-form-notes" className="label">
                {t('persons.notes')}
              </label>
              <textarea
                id="person-form-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('persons.notesPlaceholder')}
                rows={2}
                className="input min-h-[4rem] resize-y"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {person ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
