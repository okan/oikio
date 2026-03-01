import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { UserPlus, CalendarPlus, Calendar, CheckCircle, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { calculateOverallAnalytics, type OverallAnalytics } from '@/lib/analytics'
export function WelcomeHero() {
  const navigate = useNavigate()
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
  const TrendIcon = analytics
    ? analytics.meetingsTrend > 0
      ? TrendingUp
      : analytics.meetingsTrend < 0
        ? TrendingDown
        : Minus
    : Minus
  const trendColor = analytics
    ? analytics.meetingsTrend > 0
      ? 'text-emerald-600'
      : analytics.meetingsTrend < 0
        ? 'text-red-500'
        : 'text-stone-400'
    : 'text-stone-400'
  const completionColor = analytics
    ? analytics.actionCompletionRate >= 80
      ? 'text-emerald-600'
      : analytics.actionCompletionRate >= 50
        ? 'text-amber-600'
        : 'text-red-500'
    : 'text-stone-400'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">
            {t('dashboard.welcome')} 👋
          </h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {t('dashboard.summary')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/persons?new=true')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {t('dashboard.newPerson')}
          </button>
          <button
            onClick={() => navigate('/meetings?new=true')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-lg text-sm font-medium transition-colors"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            {t('dashboard.newMeeting')}
          </button>
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="h-14 bg-stone-50 rounded-lg animate-pulse" />
          <div className="h-14 bg-stone-50 rounded-lg animate-pulse" />
          <div className="h-14 bg-stone-50 rounded-lg animate-pulse" />
        </div>
      ) : analytics && (
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <Calendar className="w-4 h-4 text-stone-400" />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-stone-500">{t('miniAnalytics.thisMonth')}</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-stone-900">{analytics.meetingsThisMonth}</span>
                <span className={`text-[11px] flex items-center ${trendColor}`}>
                  <TrendIcon className="w-3 h-3 mr-0.5" />
                  {analytics.meetingsTrend > 0 ? '+' : ''}{analytics.meetingsTrend}%
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-stone-400" />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-stone-500">{t('miniAnalytics.completion')}</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${completionColor}`}>{analytics.actionCompletionRate}%</span>
                <span className="text-[11px] text-stone-400">
                  {analytics.completedActions}/{analytics.totalActions}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
            <Target className="w-4 h-4 text-stone-400" />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-stone-500">{t('miniAnalytics.avgMeetings')}</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-stone-900">{analytics.averageMeetingsPerWeek}</span>
                <span className="text-[11px] text-stone-400">/ {t('miniAnalytics.week')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
