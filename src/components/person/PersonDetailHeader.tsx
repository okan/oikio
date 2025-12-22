import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Calendar, Target, Edit2, CalendarPlus, CalendarCheck } from 'lucide-react'
import type { Person, Meeting } from '@/types'
import { Avatar, Badge, Button } from '@/components/ui'
import {
  calculateRelationshipHealth,
  getHealthColor,
  getHealthTextColor,
  getDaysSinceLastMeeting,
  getFrequencyDays,
} from '@/lib/relationships'
import { cn } from '@/lib/utils'
interface PersonDetailHeaderProps {
  person: Person
  onEdit: () => void
  onNewMeeting: () => void
  futureMeeting?: Meeting
}
export function PersonDetailHeader({ person, onEdit, onNewMeeting, futureMeeting }: PersonDetailHeaderProps) {
  const { t } = useTranslation()
  const health = calculateRelationshipHealth(person)
  const daysSince = getDaysSinceLastMeeting(person.lastMeetingDate)
  const getLastMeetingText = () => {
    if (daysSince === null) return t('relationship.neverMet')
    if (daysSince === 0) return t('relationship.today')
    if (daysSince === 1) return t('relationship.yesterday')
    return t('relationship.daysAgo', { days: daysSince })
  }
  const getFrequencyText = () => {
    if (!person.meetingFrequencyGoal) return null
    const labels: Record<string, string> = {
      weekly: t('persons.weekly'),
      biweekly: t('persons.biweekly'),
      monthly: t('persons.monthly'),
      quarterly: t('persons.quarterly'),
    }
    return labels[person.meetingFrequencyGoal]
  }
  const getNextMeetingText = () => {
    if (!person.meetingFrequencyGoal || daysSince === null) return null
    const frequency = getFrequencyDays(person.meetingFrequencyGoal)
    const daysUntilNext = frequency - daysSince
    if (daysUntilNext <= 0) return t('personDetail.meetingSoon')
    if (daysUntilNext === 1) return t('personDetail.nextTomorrow')
    return t('personDetail.nextInDays', { days: daysUntilNext })
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-start gap-6">
        <div className="relative">
          <Avatar name={person.name} size="lg" className="w-20 h-20 text-2xl" />
          <div
            className={cn(
              'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-3 border-white',
              getHealthColor(health.status)
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 truncate">{person.name}</h1>
            <Badge variant={person.role === 'manager' ? 'primary' : 'default'} size="lg">
              {person.role === 'manager' ? t('persons.manager') : t('persons.teammate')}
            </Badge>
          </div>
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className={cn('text-sm font-medium', getHealthTextColor(health.status))}>
                {futureMeeting ? (
                  <span className="text-primary-600 flex items-center gap-1">
                    <CalendarCheck className="w-4 h-4" />
                    {t('relationship.scheduled')}
                  </span>
                ) : (
                  getLastMeetingText()
                )}
              </span>
              {person.meetingFrequencyGoal && (
                <span className="text-xs text-slate-500">{health.score}/100</span>
              )}
            </div>
            {person.meetingFrequencyGoal && (
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${health.score}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={cn('h-full rounded-full', getHealthColor(health.status))}
                />
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            {getFrequencyText() && (
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {getFrequencyText()}
              </span>
            )}
            {getNextMeetingText() && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {getNextMeetingText()}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button onClick={onNewMeeting}>
            <CalendarPlus className="w-4 h-4 mr-2" />
            {t('meetings.newMeeting')}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
