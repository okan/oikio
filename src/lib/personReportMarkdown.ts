import type {
  Person,
  Meeting,
  ActionItem,
  PersonNote,
  TalkingPoint,
  MeetingSkip,
} from '@/types'
import { stripHtmlToPlainText } from '@/lib/searchPlainText'
import { formatDate, formatMeetingTitle } from '@/lib/utils'
import { getMeetingMoodEmoji } from '@/lib/meetingMood'

export interface PersonReportLabels {
  reportHeading: string
  period: string
  profile: string
  role: string
  roleManager: string
  roleTeammate: string
  jobTitle: string
  goals: string
  personNotesField: string
  cadence: string
  meetings: string
  noMeetings: string
  mood: string
  notes: string
  meetingTalkingPoints: string
  nextTopics: string
  actions: string
  assignedMe: string
  assignedOther: string
  done: string
  open: string
  progressUpdates: string
  quickNotes: string
  noQuickNotes: string
  talkingPoints: string
  noTalkingPoints: string
  talkingPointOpen: string
  talkingPointDone: string
  skips: string
  noSkips: string
  generated: string
}

function inDateRangeInclusive(isoOrDate: string, from: string, to: string): boolean {
  const key = isoOrDate.slice(0, 10)
  return key >= from && key <= to
}

function fencedPlain(text: string): string {
  const t = text.trim()
  if (!t) return ''
  const body = t.replace(/```/g, '`​``')
  return `\n\`\`\`\n${body}\n\`\`\`\n`
}

function mdBulletLines(text: string): string {
  const plain = stripHtmlToPlainText(text)
  if (!plain) return ''
  return plain
    .split('\n')
    .map((line) => (line.trim() ? `- ${line.trim()}` : ''))
    .filter(Boolean)
    .join('\n')
}

function slugifyFilePart(name: string): string {
  const s = name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
  return s || 'person'
}

export function personReportFilename(personName: string, dateFrom: string, dateTo: string): string {
  return `oikio-report-${slugifyFilePart(personName)}-${dateFrom}-${dateTo}.md`
}

export function buildPersonReportMarkdown(params: {
  person: Person
  meetings: Meeting[]
  actionsByMeetingId: Map<number, ActionItem[]>
  personNotes: PersonNote[]
  talkingPoints: TalkingPoint[]
  skips: MeetingSkip[]
  dateFrom: string
  dateTo: string
  locale: string
  labels: PersonReportLabels
  cadenceLabel: string
}): string {
  const {
    person,
    meetings,
    actionsByMeetingId,
    personNotes,
    talkingPoints,
    skips,
    dateFrom,
    dateTo,
    locale,
    labels,
    cadenceLabel,
  } = params
  const lines: string[] = []
  lines.push(`# ${labels.reportHeading}: ${person.name}`)
  lines.push('')
  lines.push(
    `*${labels.period}: ${formatDate(dateFrom, locale)} – ${formatDate(dateTo, locale)}*`
  )
  lines.push('')
  lines.push(`## ${labels.profile}`)
  lines.push('')
  lines.push(
    `- **${labels.role}:** ${person.role === 'manager' ? labels.roleManager : labels.roleTeammate}`
  )
  if (person.title?.trim()) {
    lines.push(`- **${labels.jobTitle}:** ${person.title.trim()}`)
  }
  if (cadenceLabel) {
    lines.push(`- **${labels.cadence}:** ${cadenceLabel}`)
  }
  if (person.goals?.trim()) {
    lines.push(`- **${labels.goals}:**`)
    lines.push(fencedPlain(stripHtmlToPlainText(person.goals)))
  }
  if (person.notes?.trim()) {
    lines.push(`- **${labels.personNotesField}:**`)
    lines.push(fencedPlain(stripHtmlToPlainText(person.notes)))
  }
  lines.push('')

  const meetingsInRange = meetings
    .filter((m) => inDateRangeInclusive(m.date, dateFrom, dateTo))
    .sort((a, b) => a.date.localeCompare(b.date))

  lines.push(`## ${labels.meetings}`)
  lines.push('')
  if (meetingsInRange.length === 0) {
    lines.push(labels.noMeetings)
    lines.push('')
  } else {
    for (const m of meetingsInRange) {
      const heading = formatMeetingTitle(m.title, m.date, locale)
      lines.push(`### ${formatDate(m.date, locale)} — ${heading}`)
      lines.push('')
      if (m.mood != null) {
        const emoji = getMeetingMoodEmoji(m.mood)
        lines.push(`- **${labels.mood}:** ${emoji ? `${emoji} ` : ''}(${m.mood}/5)`)
      }
      if (m.notes?.trim()) {
        lines.push(`- **${labels.notes}:**`)
        lines.push(fencedPlain(stripHtmlToPlainText(m.notes)))
      }
      if (m.talkingPoints?.trim()) {
        const block = mdBulletLines(m.talkingPoints)
        if (block) {
          lines.push(`- **${labels.meetingTalkingPoints}:**`)
          lines.push(block)
          lines.push('')
        }
      }
      if (m.nextTopics?.trim()) {
        lines.push(`- **${labels.nextTopics}:**`)
        lines.push(fencedPlain(stripHtmlToPlainText(m.nextTopics)))
      }
      const acts = actionsByMeetingId.get(m.id) ?? []
      if (acts.length > 0) {
        lines.push(`- **${labels.actions}:**`)
        lines.push('')
        for (const a of acts) {
          const box = a.completed ? '[x]' : '[ ]'
          const who =
            a.assignedTo === 'other' ? labels.assignedOther : labels.assignedMe
          const state = a.completed ? labels.done : labels.open
          lines.push(`${box} **${state}** (${who}) ${a.description}`)
          const pnotes = a.progressNotes ?? []
          if (pnotes.length > 0) {
            for (const pn of pnotes) {
              const when = formatDate(pn.createdAt, locale, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
              lines.push(`  - *${when}:* ${pn.text.replace(/\n/g, ' ')}`)
            }
          }
          if (a.tags && a.tags.length > 0) {
            lines.push(`  - *tags:* ${a.tags.map((t) => `#${t}`).join(', ')}`)
          }
        }
        lines.push('')
      }
      lines.push('')
    }
  }

  const notesInRange = personNotes.filter((n) =>
    inDateRangeInclusive(n.createdAt, dateFrom, dateTo)
  )
  lines.push(`## ${labels.quickNotes}`)
  lines.push('')
  if (notesInRange.length === 0) {
    lines.push(labels.noQuickNotes)
    lines.push('')
  } else {
    for (const n of notesInRange.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
      lines.push(`### ${formatDate(n.createdAt, locale)}`)
      lines.push(fencedPlain(stripHtmlToPlainText(n.content)))
    }
  }

  const tpInRange = talkingPoints.filter((tp) =>
    inDateRangeInclusive(tp.createdAt, dateFrom, dateTo)
  )
  lines.push(`## ${labels.talkingPoints}`)
  lines.push('')
  if (tpInRange.length === 0) {
    lines.push(labels.noTalkingPoints)
    lines.push('')
  } else {
    for (const tp of tpInRange.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
      const status = tp.completed ? labels.talkingPointDone : labels.talkingPointOpen
      lines.push(`- **${formatDate(tp.createdAt, locale)}** (${status}) ${tp.content}`)
    }
    lines.push('')
  }

  const skipsInRange = skips.filter((s) => inDateRangeInclusive(s.skippedAt, dateFrom, dateTo))
  lines.push(`## ${labels.skips}`)
  lines.push('')
  if (skipsInRange.length === 0) {
    lines.push(labels.noSkips)
    lines.push('')
  } else {
    for (const s of skipsInRange.sort((a, b) => a.skippedAt.localeCompare(b.skippedAt))) {
      lines.push(
        `- ${formatDate(s.skippedAt, locale)} → ${formatDate(s.skippedUntil, locale)}`
      )
    }
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push(`*${labels.generated} ${new Date().toISOString()}*`)
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n'
}
