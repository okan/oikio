import type { Meeting, ActionItem, Person } from '@/types'
export interface MonthlyStats {
  month: string  
  meetingsCount: number
  actionsCreated: number
  actionsCompleted: number
}
export interface OverallAnalytics {
  totalMeetings: number
  totalActions: number
  completedActions: number
  pendingActions: number
  actionCompletionRate: number
  meetingsThisMonth: number
  meetingsLastMonth: number
  meetingsTrend: number  
  averageMeetingsPerWeek: number
  monthlyStats: MonthlyStats[]
}
export interface PersonAnalytics {
  personId: number
  totalMeetings: number
  averageMeetingInterval: number  
  actionsCreated: number
  actionsCompleted: number
  actionCompletionRate: number
  lastMeetingDaysAgo: number | null
  meetingFrequencyStatus: 'on-track' | 'behind' | 'overdue' | 'never-met'
}
export function calculateOverallAnalytics(
  meetings: Meeting[],
  actions: ActionItem[]
): OverallAnalytics {
  const now = new Date()
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const currentMonth = now.toISOString().slice(0, 7)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toISOString()
    .slice(0, 7)
  const pastMeetings = meetings.filter(m => new Date(m.date) <= today)
  const meetingsThisMonth = pastMeetings.filter((m) =>
    m.date.startsWith(currentMonth)
  ).length
  const meetingsLastMonth = pastMeetings.filter((m) =>
    m.date.startsWith(lastMonth)
  ).length
  const meetingsTrend =
    meetingsLastMonth > 0
      ? Math.round(((meetingsThisMonth - meetingsLastMonth) / meetingsLastMonth) * 100)
      : meetingsThisMonth > 0
        ? 100
        : 0
  const completedActions = actions.filter((a) => a.completed).length
  const pendingActions = actions.filter((a) => !a.completed).length
  const actionCompletionRate =
    actions.length > 0 ? Math.round((completedActions / actions.length) * 100) : 0
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
  const recentMeetings = pastMeetings.filter(
    (m) => new Date(m.date) >= fourWeeksAgo
  ).length
  const averageMeetingsPerWeek = Math.round((recentMeetings / 4) * 10) / 10
  const monthlyStats: MonthlyStats[] = []
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthKey = monthDate.toISOString().slice(0, 7)
    const monthMeetings = pastMeetings.filter((m) => m.date.startsWith(monthKey))
    const monthMeetingIds = new Set(monthMeetings.map((m) => m.id))
    const monthActionsCreated = actions.filter(
      (a) => a.createdAt.startsWith(monthKey)
    ).length
    const monthActionsCompleted = actions.filter(
      (a) => a.completed && monthMeetingIds.has(a.meetingId)
    ).length
    monthlyStats.push({
      month: monthKey,
      meetingsCount: monthMeetings.length,
      actionsCreated: monthActionsCreated,
      actionsCompleted: monthActionsCompleted,
    })
  }
  return {
    totalMeetings: pastMeetings.length,
    totalActions: actions.length,
    completedActions,
    pendingActions,
    actionCompletionRate,
    meetingsThisMonth,
    meetingsLastMonth,
    meetingsTrend,
    averageMeetingsPerWeek,
    monthlyStats,
  }
}
export function calculatePersonAnalytics(
  person: Person,
  meetings: Meeting[],
  actions: ActionItem[]
): PersonAnalytics {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  const personMeetings = meetings
    .filter((m) => m.personId === person.id)
    .filter((m) => new Date(m.date) <= now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const meetingIds = new Set(personMeetings.map((m) => m.id))
  const personActions = actions.filter((a) => meetingIds.has(a.meetingId))
  let averageMeetingInterval = 0
  if (personMeetings.length > 1) {
    const intervals: number[] = []
    for (let i = 0; i < personMeetings.length - 1; i++) {
      const date1 = new Date(personMeetings[i].date)
      const date2 = new Date(personMeetings[i + 1].date)
      intervals.push(
        Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
      )
    }
    averageMeetingInterval = Math.round(
      intervals.reduce((a, b) => a + b, 0) / intervals.length
    )
  }
  let lastMeetingDaysAgo: number | null = null
  if (personMeetings.length > 0) {
    const lastMeeting = new Date(personMeetings[0].date)
    const now = new Date()
    lastMeetingDaysAgo = Math.floor(
      (now.getTime() - lastMeeting.getTime()) / (1000 * 60 * 60 * 24)
    )
  }
  const completedActions = personActions.filter((a) => a.completed).length
  const actionCompletionRate =
    personActions.length > 0
      ? Math.round((completedActions / personActions.length) * 100)
      : 0
  let meetingFrequencyStatus: 'on-track' | 'behind' | 'overdue' | 'never-met' =
    'never-met'
  if (personMeetings.length > 0 && person.meetingFrequencyGoal) {
    const goalDays: Record<string, number> = {
      weekly: 7,
      biweekly: 14,
      monthly: 30,
      quarterly: 90,
    }
    const expectedInterval = goalDays[person.meetingFrequencyGoal] || 30
    if (lastMeetingDaysAgo !== null) {
      if (lastMeetingDaysAgo <= expectedInterval) {
        meetingFrequencyStatus = 'on-track'
      } else if (lastMeetingDaysAgo <= expectedInterval * 1.5) {
        meetingFrequencyStatus = 'behind'
      } else {
        meetingFrequencyStatus = 'overdue'
      }
    }
  } else if (personMeetings.length > 0) {
    meetingFrequencyStatus = 'on-track'  
  }
  return {
    personId: person.id,
    totalMeetings: personMeetings.length,
    averageMeetingInterval,
    actionsCreated: personActions.length,
    actionsCompleted: completedActions,
    actionCompletionRate,
    lastMeetingDaysAgo,
    meetingFrequencyStatus,
  }
}
export function formatTrend(value: number): string {
  if (value > 0) return `↑ ${value}%`
  if (value < 0) return `↓ ${Math.abs(value)}%`
  return '→ 0%'
}
export function getTrendColor(value: number): string {
  if (value > 0) return 'text-green-600'
  if (value < 0) return 'text-red-600'
  return 'text-slate-500'
}
export function formatMonth(monthStr: string): string {
  const date = new Date(monthStr + '-01')
  return date.toLocaleDateString('tr-TR', { month: 'short' })
}
