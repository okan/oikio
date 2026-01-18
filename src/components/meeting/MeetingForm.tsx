import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, CheckSquare, ListTodo } from 'lucide-react'
import type { Meeting, Person, Template, ActionItem } from '@/types'
import { Button, Input, Select, Modal, RichTextEditor } from '@/components/ui'
import { toInputDate } from '@/lib/utils'
interface MeetingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting?: Meeting | null
  persons: Person[]
  templates: Template[]
  defaultPersonId?: number
  onSubmit: (data: Omit<Meeting, 'id' | 'createdAt'>) => Promise<Meeting | void>
}
interface LastMeetingContext {
  meeting: Meeting | null
  pendingActions: ActionItem[]
  nextTopics: string | null
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
  const [lastMeetingContext, setLastMeetingContext] = useState<LastMeetingContext | null>(null)
  const [showPrepSection, setShowPrepSection] = useState(true)
  useEffect(() => {
    const fetchLastMeetingContext = async () => {
      if (!personId || meeting) {
        setLastMeetingContext(null)
        return
      }
      try {
        const meetings = await window.api.meetings.getByPerson(parseInt(personId))
        if (meetings.length === 0) {
          setLastMeetingContext(null)
          return
        }
        const lastMeeting = meetings[0]
        const actions = await window.api.actions.getByMeeting(lastMeeting.id)
        const pendingActions = actions.filter((a) => !a.completed)
        setLastMeetingContext({
          meeting: lastMeeting,
          pendingActions,
          nextTopics: lastMeeting.nextTopics || null,
        })
      } catch (error) {
        console.error('Error fetching last meeting context:', error)
        setLastMeetingContext(null)
      }
    }
    fetchLastMeetingContext()
  }, [personId, meeting])
  useEffect(() => {
    if (meeting) {
      setPersonId(meeting.personId.toString())
      setTemplateId(meeting.templateId?.toString() || '')
      setDate(toInputDate(meeting.date))
      setTitle(meeting.title || '')
      setNotes(meeting.notes || '')
    } else {
      setPersonId(defaultPersonId?.toString() || '')
      setTemplateId('')
      setDate(toInputDate(new Date()))
      setTitle('')
      setNotes('')
    }
    setErrors({})
    setShowPrepSection(true)
  }, [meeting, open, defaultPersonId])
  const handleTemplateChange = (value: string) => {
    setTemplateId(value)
    if (value && meeting) {
      const template = templates.find((t) => t.id.toString() === value)
      if (template) {
        setNotes(template.content)
      }
    }
  }
  const isCreating = !meeting
  const hasPreselectedPerson = isCreating && defaultPersonId !== undefined
  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!personId) {
      newErrors.personId = t('meetings.person') + ' required'
    }
    if (!date) {
      newErrors.date = t('meetings.date') + ' required'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      let notesContent = notes.trim() || undefined
      if (isCreating && templateId) {
        const template = templates.find((t) => t.id.toString() === templateId)
        if (template) {
          notesContent = template.content
        }
      }
      const result = await onSubmit({
        personId: parseInt(personId),
        templateId: templateId ? parseInt(templateId) : undefined,
        date,
        title: title.trim() || undefined,
        notes: notesContent,
      })
      onOpenChange(false)
      return result
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
  const hasContext = lastMeetingContext &&
    (lastMeetingContext.pendingActions.length > 0 || lastMeetingContext.nextTopics)
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={meeting ? t('meetings.editMeeting') : t('meetings.newMeeting')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {hasPreselectedPerson ? (
            <div className="space-y-1.5">
              <label className="label">{t('meetings.person')}</label>
              <div className="input bg-slate-50 text-slate-700">
                {persons.find(p => p.id === defaultPersonId)?.name}
              </div>
            </div>
          ) : (
            <Select
              label={t('meetings.person')}
              placeholder={t('meetings.selectPerson')}
              value={personId}
              onValueChange={setPersonId}
              options={personOptions}
              error={errors.personId}
              disabled={!!meeting}
            />
          )}
          <Input
            label={t('meetings.date')}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
          />
        </div>
        {isCreating && hasContext && showPrepSection && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium text-sm">{t('meetings.prepSection')}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPrepSection(false)}
                className="text-amber-600 hover:text-amber-800 text-xs"
              >
                {t('common.dismiss')}
              </button>
            </div>
            {lastMeetingContext.pendingActions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <CheckSquare className="w-4 h-4" />
                  <span>{t('meetings.pendingFromLast', { count: lastMeetingContext.pendingActions.length })}</span>
                </div>
                <ul className="space-y-1 pl-6">
                  {lastMeetingContext.pendingActions.slice(0, 3).map((action) => (
                    <li key={action.id} className="text-sm text-amber-700 list-disc">
                      {action.description}
                    </li>
                  ))}
                  {lastMeetingContext.pendingActions.length > 3 && (
                    <li className="text-sm text-amber-600 italic">
                      +{lastMeetingContext.pendingActions.length - 3} {t('common.more')}
                    </li>
                  )}
                </ul>
              </div>
            )}
            {lastMeetingContext.nextTopics && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <ListTodo className="w-4 h-4" />
                  <span>{t('meetings.topicsFromLast')}</span>
                </div>
                <p className="text-sm text-amber-700 pl-6 line-clamp-2">
                  {lastMeetingContext.nextTopics}
                </p>
              </div>
            )}
          </div>
        )}
        {isCreating ? (
          <Select
            label={t('meetings.template')}
            placeholder={t('meetings.selectTemplate')}
            value={templateId}
            onValueChange={handleTemplateChange}
            options={templateOptions}
          />
        ) : (
          <>
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
          </>
        )}
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
