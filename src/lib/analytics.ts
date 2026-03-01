import type { Meeting, ActionItem } from '@/types'
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
