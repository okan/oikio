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
export function calculateRelationshipHealth(person: Person): RelationshipHealth {
  const daysSince = getDaysSinceLastMeeting(person.lastMeetingDate)
  const expectedDays = getFrequencyDays(person.meetingFrequencyGoal)
  if (!person.meetingFrequencyGoal && daysSince === null) {
    return {
      score: 50,
      status: 'warning',
      daysSinceLastMeeting: null,
      isOverdue: false,
      daysOverdue: 0,
    }
  }
  if (daysSince === null) {
    return {
      score: 0,
      status: 'critical',
      daysSinceLastMeeting: null,
      isOverdue: false,
      daysOverdue: 0,
    }
  }
  const progress = daysSince / expectedDays
  const gracePeriod = expectedDays * 0.2  
  const isOverdue = daysSince > expectedDays
  const daysOverdue = Math.max(0, daysSince - expectedDays)
  let score: number
  let status: 'good' | 'warning' | 'critical'
  if (daysSince <= expectedDays) {
    score = Math.round(100 - (progress * 30))  
    status = 'good'
  } else if (daysSince <= expectedDays + gracePeriod) {
    const graceProgress = (daysSince - expectedDays) / gracePeriod
    score = Math.round(70 - (graceProgress * 20))  
    status = 'warning'
  } else {
    const overdueRatio = daysOverdue / expectedDays
    score = Math.max(0, Math.round(50 - (overdueRatio * 50)))  
    status = 'critical'
  }
  return {
    score,
    status,
    daysSinceLastMeeting: daysSince,
    isOverdue,
    daysOverdue,
  }
}
export function getHealthDescription(health: RelationshipHealth, t: (key: string, options?: Record<string, unknown>) => string): string {
  if (health.daysSinceLastMeeting === null) {
    return t('persons.neverMet')
  }
  if (health.status === 'good') {
    return t('relationships.onTrack')
  }
  if (health.isOverdue) {
    return t('persons.daysOverdue', { days: health.daysOverdue })
  }
  return t('persons.daysAgo', { days: health.daysSinceLastMeeting })
}
export function getHealthColor(status: 'good' | 'warning' | 'critical'): string {
  const colors = {
    good: 'bg-green-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
  }
  return colors[status]
}
export function getHealthTextColor(status: 'good' | 'warning' | 'critical'): string {
  const colors = {
    good: 'text-green-600',
    warning: 'text-amber-600',
    critical: 'text-red-600',
  }
  return colors[status]
}
export function getHealthBgColor(status: 'good' | 'warning' | 'critical'): string {
  const colors = {
    good: 'bg-green-100',
    warning: 'bg-amber-100',
    critical: 'bg-red-100',
  }
  return colors[status]
}
