import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FileDown } from 'lucide-react'
import type { Person, Meeting, ActionItem, MeetingSkip } from '@/types'
import { personNoteService, talkingPointService } from '@/services'
import { Button, Input } from '@/components/ui'
import { toInputDate } from '@/lib/utils'
import {
  buildPersonReportMarkdown,
  personReportFilename,
  type PersonReportLabels,
} from '@/lib/personReportMarkdown'

interface PersonReportExportProps {
  person: Person
  meetings: Meeting[]
  actions: ActionItem[]
  skips: MeetingSkip[]
}

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function PersonReportExport({ person, meetings, actions, skips }: PersonReportExportProps) {
  const { t, i18n } = useTranslation()
  const [dateTo, setDateTo] = useState(() => toInputDate(new Date()))
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    return toInputDate(d)
  })
  const [busy, setBusy] = useState(false)

  const actionsByMeetingId = useMemo(() => {
    const m = new Map<number, ActionItem[]>()
    for (const a of actions) {
      const list = m.get(a.meetingId) ?? []
      list.push(a)
      m.set(a.meetingId, list)
    }
    return m
  }, [actions])

  const cadenceLabel = person.meetingFrequencyGoal
    ? t(`persons.${person.meetingFrequencyGoal}`)
    : ''

  const labels: PersonReportLabels = useMemo(
    () => ({
      reportHeading: t('personReport.reportHeading'),
      period: t('personReport.period'),
      profile: t('personReport.profile'),
      role: t('personReport.role'),
      roleManager: t('persons.manager'),
      roleTeammate: t('persons.teammate'),
      jobTitle: t('persons.jobTitle'),
      goals: t('persons.goals'),
      personNotesField: t('persons.notes'),
      cadence: t('persons.meetingFrequency'),
      meetings: t('personReport.meetings'),
      noMeetings: t('personReport.noMeetings'),
      mood: t('meetings.moodLabel'),
      notes: t('meetings.notes'),
      meetingTalkingPoints: t('personReport.meetingTalkingPointsField'),
      nextTopics: t('meetings.nextTopics'),
      actions: t('nav.actions'),
      assignedMe: t('actions.me'),
      assignedOther: t('actions.other'),
      done: t('personReport.actionDone'),
      open: t('personReport.actionOpen'),
      progressUpdates: t('actions.progressUpdates'),
      quickNotes: t('personReport.quickNotes'),
      noQuickNotes: t('personReport.noQuickNotes'),
      talkingPoints: t('talkingPoints.title'),
      noTalkingPoints: t('personReport.noTalkingPoints'),
      talkingPointOpen: t('personReport.talkingPointOpen'),
      talkingPointDone: t('personReport.talkingPointDone'),
      skips: t('skip.history'),
      noSkips: t('personReport.noSkips'),
      generated: t('personReport.generated'),
    }),
    [t]
  )

  const handleExport = async () => {
    if (dateFrom > dateTo) {
      return
    }
    setBusy(true)
    try {
      const [personNotes, talkingPoints] = await Promise.all([
        personNoteService.getByPerson(person.id),
        talkingPointService.getByPerson(person.id),
      ])
      const md = buildPersonReportMarkdown({
        person,
        meetings,
        actionsByMeetingId,
        personNotes,
        talkingPoints,
        skips,
        dateFrom,
        dateTo,
        locale: i18n.language,
        labels,
        cadenceLabel,
      })
      downloadMarkdown(personReportFilename(person.name, dateFrom, dateTo), md)
      toast.success(t('personReport.success'))
    } catch (e) {
      console.error(e)
      toast.error(t('common.error'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="card p-4">
      <h3 className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-3">
        {t('personReport.title')}
      </h3>
      <p className="text-xs text-stone-500 mb-3">{t('personReport.description')}</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Input
          id="person-report-from"
          type="date"
          label={t('personReport.from')}
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          id="person-report-to"
          type="date"
          label={t('personReport.to')}
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>
      {dateFrom > dateTo && (
        <p className="text-xs text-red-500 mb-2">{t('personReport.invalidRange')}</p>
      )}
      <Button
        type="button"
        className="w-full"
        variant="secondary"
        size="sm"
        onClick={() => void handleExport()}
        isLoading={busy}
        disabled={dateFrom > dateTo}
        leftIcon={<FileDown className="w-3.5 h-3.5" />}
      >
        {t('personReport.download')}
      </Button>
    </div>
  )
}
