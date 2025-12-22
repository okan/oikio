import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, TrendingDown, Minus, CheckCircle, Calendar } from 'lucide-react'

import {
  calculateOverallAnalytics,
  formatTrend,
  getTrendColor,
  formatMonth,
  type OverallAnalytics,
} from '@/lib/analytics'
export function AnalyticsWidget() {
  const { t } = useTranslation()
  const [analytics, setAnalytics] = useState<OverallAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [meetings, actions] = await Promise.all([
          window.api.meetings.getAll(),
          window.api.actions.getAll(),
        ])
        const stats = calculateOverallAnalytics(meetings, actions)
        setAnalytics(stats)
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadAnalytics()
  }, [])
  if (isLoading || !analytics) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="h-24 bg-slate-200 rounded" />
        </div>
      </div>
    )
  }
  const TrendIcon =
    analytics.meetingsTrend > 0
      ? TrendingUp
      : analytics.meetingsTrend < 0
        ? TrendingDown
        : Minus
  const maxMeetings = Math.max(...analytics.monthlyStats.map((s) => s.meetingsCount), 1)
  const barHeights = analytics.monthlyStats.map((s) =>
    Math.max(4, Math.round((s.meetingsCount / maxMeetings) * 60))
  )
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-primary-600" />
        <h2 className="font-semibold text-slate-900">{t('analytics.title')}</h2>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">{t('analytics.thisMonth')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {analytics.meetingsThisMonth}
            </span>
            <span className={`text-xs flex items-center ${getTrendColor(analytics.meetingsTrend)}`}>
              <TrendIcon className="w-3 h-3 mr-0.5" />
              {formatTrend(analytics.meetingsTrend)}
            </span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">{t('analytics.completionRate')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {analytics.actionCompletionRate}%
            </span>
            <span className="text-xs text-slate-500">
              {analytics.completedActions}/{analytics.totalActions}
            </span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs">{t('analytics.avgPerWeek')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {analytics.averageMeetingsPerWeek}
            </span>
            <span className="text-xs text-slate-500">{t('analytics.meetings')}</span>
          </div>
        </div>
      </div>
      { }
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-500">{t('analytics.last6Months')}</span>
          <span className="text-xs text-slate-500">
            {analytics.totalMeetings} {t('analytics.total')}
          </span>
        </div>
        <div className="flex items-end gap-2 h-16">
          {analytics.monthlyStats.map((stat, index) => (
            <div key={stat.month} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: barHeights[index] }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="w-full bg-primary-500 rounded-t"
                title={`${stat.meetingsCount} ${t('analytics.meetings')}`}
              />
              <span className="text-[10px] text-slate-400">{formatMonth(stat.month)}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
