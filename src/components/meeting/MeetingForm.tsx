import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Meeting, Person, Template } from '@/types'
import { Button, Input, Select, Modal, RichTextEditor } from '@/components/ui'
import { toInputDate } from '@/lib/utils'

interface MeetingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting?: Meeting | null
  persons: Person[]
  templates: Template[]
  defaultPersonId?: number
  onSubmit: (data: Omit<Meeting, 'id' | 'createdAt'>) => Promise<void>
}

export function MeetingForm({
  open,
  onOpenChange,
  meeting,
  persons,
  templates,
  defaultPersonId,
  onSubmit,
}: MeetingFormProps) {
  const { t } = useTranslation()
  const [personId, setPersonId] = useState<string>('')
  const [templateId, setTemplateId] = useState<string>('')
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (meeting) {
      setPersonId(meeting.personId.toString())
      setTemplateId(meeting.templateId?.toString() || '')
      setDate(toInputDate(meeting.date))
      setTitle(meeting.title)
      setNotes(meeting.notes || '')
    } else {
      setPersonId(defaultPersonId?.toString() || '')
      setTemplateId('')
      setDate(toInputDate(new Date()))
      setTitle('')
      setNotes('')
    }
    setErrors({})
  }, [meeting, open, defaultPersonId])

  const handleTemplateChange = (value: string) => {
    setTemplateId(value)
    if (value) {
      const template = templates.find((t) => t.id.toString() === value)
      if (template) {
        setNotes(template.content)
      }
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!personId) {
      newErrors.personId = t('meetings.person') + ' required'
    }

    if (!date) {
      newErrors.date = t('meetings.date') + ' required'
    }

    if (!title.trim()) {
      newErrors.title = t('meetings.meetingTitle') + ' required'
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
        personId: parseInt(personId),
        templateId: templateId ? parseInt(templateId) : undefined,
        date,
        title: title.trim(),
        notes: notes.trim() || undefined,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving meeting:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const personOptions = persons.map((p) => ({
    value: p.id.toString(),
    label: p.name,
  }))

  const templateOptions = templates.map((t) => ({
    value: t.id.toString(),
    label: t.name,
  }))

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={meeting ? t('meetings.editMeeting') : t('meetings.newMeeting')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label={t('meetings.person')}
            placeholder={t('meetings.selectPerson')}
            value={personId}
            onValueChange={setPersonId}
            options={personOptions}
            error={errors.personId}
          />

          <Input
            label={t('meetings.date')}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('meetings.meetingTitle')}
            placeholder={t('meetings.titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
          />

          <Select
            label={t('meetings.template')}
            placeholder={t('meetings.selectTemplate')}
            value={templateId}
            onValueChange={handleTemplateChange}
            options={templateOptions}
          />
        </div>

        <RichTextEditor
          label={t('meetings.notes')}
          placeholder={t('meetings.notesPlaceholder')}
          value={notes}
          onChange={setNotes}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {meeting ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
