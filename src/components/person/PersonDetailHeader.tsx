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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 sticky top-6"
    >
      <div className="flex flex-col items-center text-center mb-4">
        <div className="relative mb-3">
          <Avatar name={person.name} size="lg" className="w-16 h-16 text-xl" />
          <div
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white',
              getHealthColor(health.status)
            )}
          />
        </div>
        <h1 className="text-lg font-semibold text-stone-900 truncate">{person.name}</h1>
        <Badge variant={person.role === 'manager' ? 'primary' : 'default'} size="sm" className="mt-1">
          {person.role === 'manager' ? t('persons.manager') : t('persons.teammate')}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between py-2 px-3 bg-stone-50 rounded-lg">
          <span className="text-xs text-stone-500">{t('personDetail.status')}</span>
          <span className={cn('text-xs font-medium', getHealthTextColor(health.status))}>
            {futureMeeting ? (
              <span className="text-blue-600 flex items-center gap-1">
                <CalendarCheck className="w-3 h-3" />
                {t('relationship.scheduled')}
              </span>
            ) : (
              getLastMeetingText()
            )}
          </span>
        </div>

        {person.meetingFrequencyGoal && person.lastMeetingDate && (
          <div className="px-3">
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${health.score}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn('h-full rounded-full', getHealthColor(health.status))}
              />
            </div>
            <div className="flex justify-between mt-1 text-[11px] text-stone-400">
              <span>{t('personDetail.lastMet')}</span>
              <span>{t('personDetail.nextDue')}</span>
            </div>
          </div>
        )}

        {getFrequencyText() && (
          <div className="flex items-center justify-between py-2 px-3 bg-stone-50 rounded-lg">
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Target className="w-3 h-3" />
              {t('personDetail.frequency')}
            </span>
            <span className="text-xs font-medium text-stone-700">{getFrequencyText()}</span>
          </div>
        )}

        {getNextMeetingText() && (
          <div className="flex items-center justify-between py-2 px-3 bg-stone-50 rounded-lg">
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t('personDetail.nextMeeting')}
            </span>
            <span className="text-xs font-medium text-stone-700">{getNextMeetingText()}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onEdit} className="flex-1">
          <Edit2 className="w-3.5 h-3.5 mr-1.5" />
          {t('common.edit')}
        </Button>
        <Button size="sm" onClick={onNewMeeting} className="flex-1">
          <CalendarPlus className="w-3.5 h-3.5 mr-1.5" />
          {t('meetings.newMeeting')}
        </Button>
      </div>
    </motion.div>
  )
}
