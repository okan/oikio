import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Calendar, CheckCircle, Target } from 'lucide-react'
import type { Meeting as _Meeting, ActionItem as _ActionItem } from '@/types'
import { calculateOverallAnalytics, type OverallAnalytics } from '@/lib/analytics'
export function MiniAnalytics() {
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
  if (isLoading) {
    return (
      <div className="card p-4">
        <div className="animate-pulse flex items-center gap-6">
          <div className="h-12 w-20 bg-slate-200 rounded" />
          <div className="h-12 w-20 bg-slate-200 rounded" />
          <div className="h-12 w-20 bg-slate-200 rounded" />
        </div>
      </div>
    )
  }
  if (!analytics) return null
  const TrendIcon =
    analytics.meetingsTrend > 0
      ? TrendingUp
      : analytics.meetingsTrend < 0
      ? TrendingDown
      : Minus
  const trendColor =
    analytics.meetingsTrend > 0
      ? 'text-green-600'
      : analytics.meetingsTrend < 0
      ? 'text-red-600'
      : 'text-slate-500'
  const completionColor =
    analytics.actionCompletionRate >= 80
      ? 'text-green-600'
      : analytics.actionCompletionRate >= 50
      ? 'text-amber-600'
      : 'text-red-600'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 bg-gradient-to-r from-slate-50 to-white"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          { }
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {analytics.meetingsThisMonth}
                </span>
                <span className={`text-xs flex items-center ${trendColor}`}>
                  <TrendIcon className="w-3 h-3 mr-0.5" />
                  {analytics.meetingsTrend > 0 ? '+' : ''}
                  {analytics.meetingsTrend}%
                </span>
              </div>
              <span className="text-xs text-slate-500">{t('miniAnalytics.thisMonth')}</span>
            </div>
          </div>
          { }
          <div className="w-px h-10 bg-slate-200" />
          { }
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${completionColor}`}>
                  {analytics.actionCompletionRate}%
                </span>
                <span className="text-xs text-slate-500">
                  ({analytics.completedActions}/{analytics.totalActions})
                </span>
              </div>
              <span className="text-xs text-slate-500">{t('miniAnalytics.completion')}</span>
            </div>
          </div>
          { }
          <div className="w-px h-10 bg-slate-200" />
          { }
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900">
                  {analytics.averageMeetingsPerWeek}
                </span>
                <span className="text-sm text-slate-500">/ {t('miniAnalytics.week')}</span>
              </div>
              <span className="text-xs text-slate-500">{t('miniAnalytics.avgMeetings')}</span>
            </div>
          </div>
        </div>
        { }
        <div className="flex items-end gap-1 h-8">
          {analytics.monthlyStats.slice(-4).map((stat, index) => {
            const maxMeetings = Math.max(
              ...analytics.monthlyStats.slice(-4).map((s) => s.meetingsCount),
              1
            )
            const height = Math.max(4, Math.round((stat.meetingsCount / maxMeetings) * 32))
            return (
              <motion.div
                key={stat.month}
                initial={{ height: 0 }}
                animate={{ height }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="w-2 bg-primary-400 rounded-sm"
                title={`${stat.meetingsCount} ${t('analytics.meetings')}`}
              />
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
