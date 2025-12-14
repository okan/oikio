import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Person, PersonRole, MeetingFrequency } from '@/types'
import { Button, Input, Select, Modal } from '@/components/ui'
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
    } else {
      setName('')
      setRole('teammate')
      setMeetingFrequencyGoal('')
    }
    setErrors({})
  }, [person, open])
  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = t('persons.name') + ' required'
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
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {person ? t('common.save') : t('common.add')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
