import type { Person, MeetingFrequency, RelationshipHealth } from '@/types'
export function getFrequencyDays(frequency?: MeetingFrequency): number {
  const intervals: Record<MeetingFrequency, number> = {
    weekly: 7,
    biweekly: 14,
    monthly: 30,
    quarterly: 90,
  }
  return frequency ? intervals[frequency] : 30
}
export function getDaysSinceLastMeeting(lastMeetingDate?: string): number | null {
  if (!lastMeetingDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lastMeeting = new Date(lastMeetingDate)
  lastMeeting.setHours(0, 0, 0, 0)
  return Math.floor((today.getTime() - lastMeeting.getTime()) / (1000 * 60 * 60 * 24))
}
function isSkipActive(skippedUntil?: string): boolean {
  if (!skippedUntil) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const until = new Date(skippedUntil)
  until.setHours(23, 59, 59, 999)
  return until >= today
}
export function calculateRelationshipHealth(person: Person): RelationshipHealth {
  const daysSince = getDaysSinceLastMeeting(person.lastMeetingDate)
  const goal = person.meetingFrequencyGoal
  const skipped = isSkipActive(person.skippedUntil)
  if (!goal && daysSince === null) {
    return {
      score: 0,
      status: skipped ? 'good' : 'warning',
      daysSinceLastMeeting: null,
      isOverdue: false,
      isSkipped: skipped,
      daysOverdue: 0,
    }
  }
  if (!goal && daysSince !== null) {
    return {
      score: 0,
      status: skipped ? 'good' : 'neutral',
      daysSinceLastMeeting: daysSince,
      isOverdue: false,
      isSkipped: skipped,
      daysOverdue: 0,
    }
  }
  if (daysSince === null) {
    return {
      score: 0,
      status: skipped ? 'good' : 'critical',
      daysSinceLastMeeting: null,
      isOverdue: false,
      isSkipped: skipped,
      daysOverdue: 0,
    }
  }
  const expectedDays = getFrequencyDays(goal!)
  const progress = Math.min(100, Math.round((daysSince / expectedDays) * 100))
  const isOverdue = daysSince > expectedDays
  const daysOverdue = Math.max(0, daysSince - expectedDays)
  let status: 'good' | 'warning' | 'critical'
  if (skipped) {
    status = 'good'
  } else if (daysSince <= expectedDays * 0.8) {
    status = 'good'
  } else if (daysSince <= expectedDays) {
    status = 'warning'
  } else {
    status = 'critical'
  }
  return {
    score: progress,
    status,
    daysSinceLastMeeting: daysSince,
    isOverdue: skipped ? false : isOverdue,
    isSkipped: skipped,
    daysOverdue: skipped ? 0 : daysOverdue,
  }
}
export function getHealthDescription(health: RelationshipHealth, t: (key: string, options?: Record<string, unknown>) => string): string {
  if (health.daysSinceLastMeeting === null) {
    return t('persons.neverMet')
  }
  if (health.status === 'good') {
    return t('relationships.onTrack')
  }
  if (health.status === 'neutral') {
    return t('relationships.neutral')
  }
  if (health.isOverdue) {
    return t('persons.daysOverdue', { days: health.daysOverdue })
  }
  return t('persons.daysAgo', { days: health.daysSinceLastMeeting })
}
export function getHealthColor(status: 'good' | 'warning' | 'critical' | 'neutral'): string {
  const colors = {
    good: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
    neutral: 'bg-stone-400',
  }
  return colors[status]
}
export function getHealthTextColor(status: 'good' | 'warning' | 'critical' | 'neutral'): string {
  const colors = {
    good: 'text-green-600',
    warning: 'text-amber-600',
    critical: 'text-red-600',
    neutral: 'text-stone-500',
  }
  return colors[status]
}
