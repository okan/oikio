import type { Person, Template } from '@/types'
import { getFrequencyDays } from '@/lib/relationships'
import { parseMeetingLocalDate } from '@/lib/weeklySchedule'
import { toInputDate } from '@/lib/utils'

function startOfLocalDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addCalendarDays(d: Date, days: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function firstDayAfterActiveSkip(skippedUntil: string | undefined, anchor: Date): Date | null {
  if (!skippedUntil) return null
  const untilDay = startOfLocalDay(parseMeetingLocalDate(skippedUntil))
  const today = startOfLocalDay(anchor)
  if (today.getTime() > untilDay.getTime()) return null
  return addCalendarDays(untilDay, 1)
}

export function calculateNextMeetingDate(person: Person, anchor: Date = new Date()): string {
  const today = startOfLocalDay(anchor)
  const interval = person.meetingFrequencyGoal
    ? getFrequencyDays(person.meetingFrequencyGoal)
    : 7
  let base = person.lastMeetingDate
    ? startOfLocalDay(parseMeetingLocalDate(person.lastMeetingDate))
    : today
  if (base.getTime() > today.getTime()) {
    base = today
  }
  let candidate = addCalendarDays(base, interval)
  while (candidate.getTime() < today.getTime()) {
    candidate = addCalendarDays(candidate, interval)
  }
  const afterSkip = firstDayAfterActiveSkip(person.skippedUntil, anchor)
  if (afterSkip) {
    while (candidate.getTime() < afterSkip.getTime()) {
      candidate = addCalendarDays(candidate, interval)
    }
  }
  return toInputDate(candidate)
}

export function pickDefaultTemplateForPerson(person: Person, templates: Template[]): number | undefined {
  const role = person.role
  const sorted = [...templates].sort((a, b) => {
    const aMatch = a.category === role || a.category === 'general'
    const bMatch = b.category === role || b.category === 'general'
    if (aMatch && !bMatch) return -1
    if (!aMatch && bMatch) return 1
    return 0
  })
  return sorted[0]?.id
}
