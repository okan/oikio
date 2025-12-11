import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Users, Calendar, CheckSquare } from 'lucide-react'
import { useMeetingStore, useActionStore } from '@/store'
import type { DashboardStats } from '@/types'
import {
  StatsCard,
  UpcomingMeetings,
  PendingActions,
  RecentActivity,
  QuickActions,
} from '@/components/dashboard'

export function Dashboard() {
  const { t } = useTranslation()
  const { upcomingMeetings, recentMeetings, fetchUpcomingMeetings, fetchRecentMeetings } =
    useMeetingStore()
  const { pendingActions, fetchPendingActions } = useActionStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchUpcomingMeetings(7),
        fetchRecentMeetings(5),
        fetchPendingActions(),
      ])

      const dashboardStats = await window.api.stats.getDashboard()
      setStats(dashboardStats)
    }

    loadData()
  }, [fetchUpcomingMeetings, fetchRecentMeetings, fetchPendingActions])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.welcome')} 👋</h1>
        <p className="text-slate-500 mt-1">{t('dashboard.summary')}</p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <StatsCard
            title={t('dashboard.totalPersons')}
            value={stats.totalPersons}
            icon={<Users className="w-6 h-6" />}
          />
          <StatsCard
            title={t('dashboard.meetingsThisMonth')}
            value={stats.meetingsThisMonth}
            icon={<Calendar className="w-6 h-6" />}
          />
          <StatsCard
            title={t('dashboard.pendingActions')}
            value={stats.pendingActions}
            icon={<CheckSquare className="w-6 h-6" />}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-2 gap-6">
        <UpcomingMeetings meetings={upcomingMeetings} />
        <PendingActions actions={pendingActions} />
      </div>

      {/* Recent Activity */}
      <RecentActivity meetings={recentMeetings} />
    </div>
  )
}
