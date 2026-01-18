import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { BarChart3, Calendar, CheckCircle, TrendingUp, Clock } from 'lucide-react'
import type { Person } from '@/types'
import { calculatePersonAnalytics, type PersonAnalytics } from '@/lib/analytics'
import { calculateRelationshipHealth, getHealthColor, getHealthTextColor } from '@/lib/relationships'
interface PersonStatsCardProps {
  person: Person
}
export function PersonStatsCard({ person }: PersonStatsCardProps) {
  const { t } = useTranslation()
  const [analytics, setAnalytics] = useState<PersonAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [meetings, actions] = await Promise.all([
          window.api.meetings.getByPerson(person.id),
          window.api.actions.getAll(),
        ])
        const stats = calculatePersonAnalytics(person, meetings, actions)
        setAnalytics(stats)
      } catch (error) {
        console.error('Error loading analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadAnalytics()
  }, [person])
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-slate-200 rounded" />
            <div className="h-16 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    )
  }
  if (!analytics) return null
  const health = calculateRelationshipHealth(person)
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'on-track': t('personStats.onTrack'),
      'behind': t('personStats.behind'),
      'overdue': t('personStats.overdue'),
      'never-met': t('personStats.neverMet'),
    }
    return labels[status] || status
  }
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'on-track': 'text-green-600 bg-green-50',
      'behind': 'text-amber-600 bg-amber-50',
      'overdue': 'text-red-600 bg-red-50',
      'never-met': 'text-slate-600 bg-slate-50',
    }
    return colors[status] || 'text-slate-600 bg-slate-50'
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-slate-900">{t('personStats.title')}</h2>
        </div>
        {person.meetingFrequencyGoal && (
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(analytics.meetingFrequencyStatus)}`}>
            {getStatusLabel(analytics.meetingFrequencyStatus)}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">{t('personStats.totalMeetings')}</span>
          </div>
          <span className="text-2xl font-bold text-slate-900">{analytics.totalMeetings}</span>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">{t('personStats.avgInterval')}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {analytics.averageMeetingInterval || '-'}
            </span>
            {analytics.averageMeetingInterval > 0 && (
              <span className="text-sm text-slate-500">{t('personStats.days')}</span>
            )}
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs">{t('personStats.actionSuccess')}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {analytics.actionCompletionRate}%
            </span>
            <span className="text-xs text-slate-500">
              {analytics.actionsCompleted}/{analytics.actionsCreated}
            </span>
          </div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">{t('personStats.lastMeeting')}</span>
          </div>
          <div className="flex items-baseline gap-1">
            {analytics.lastMeetingDaysAgo !== null ? (
              <>
                <span className={`text-2xl font-bold ${getHealthTextColor(health.status)}`}>
                  {analytics.lastMeetingDaysAgo}
                </span>
                <span className="text-sm text-slate-500">{t('personStats.daysAgo')}</span>
              </>
            ) : (
              <span className="text-lg text-slate-500">{t('persons.neverMet')}</span>
            )}
          </div>
        </div>
      </div>
      { }
      {person.meetingFrequencyGoal && person.lastMeetingDate && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500">{t('personStats.relationshipHealth')}</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${health.score}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full ${getHealthColor(health.status)}`}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-slate-400">
            <span>{t('personDetail.lastMet')}</span>
            <span>{t('personDetail.nextDue')}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
