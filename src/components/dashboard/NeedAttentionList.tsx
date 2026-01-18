import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Users, AlertCircle, ChevronRight, CalendarPlus } from 'lucide-react'
import type { Person, MeetingFrequency } from '@/types'
import { Avatar, Badge, EmptyState, Button } from '@/components/ui'
interface NeedAttentionListProps {
  persons: Person[]
}
function getDaysSinceLastMeeting(lastMeetingDate?: string): number | null {
  if (!lastMeetingDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const lastMeeting = new Date(lastMeetingDate)
  return Math.floor((today.getTime() - lastMeeting.getTime()) / (1000 * 60 * 60 * 24))
}
function getFrequencyThreshold(frequency?: MeetingFrequency): number {
  const thresholds: Record<MeetingFrequency, number> = {
    weekly: 7,
    biweekly: 14,
    monthly: 30,
    quarterly: 90,
  }
  return frequency ? thresholds[frequency] : 30
}
function getDaysOverdue(lastMeetingDate?: string, frequency?: MeetingFrequency): number {
  const days = getDaysSinceLastMeeting(lastMeetingDate)
  if (days === null) return 0
  const threshold = getFrequencyThreshold(frequency)
  return Math.max(0, days - threshold)
}
export function NeedAttentionList({ persons }: NeedAttentionListProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const handleScheduleMeeting = (personId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/meetings?new=true&personId=${personId}`)
  }
  return (
    <div className="card">
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-slate-900">{t('dashboard.needAttention')}</h2>
        </div>
        <p className="text-sm text-slate-500 mt-1">{t('dashboard.needAttentionDesc')}</p>
      </div>
      <div className="divide-y divide-slate-100">
        {persons.length === 0 ? (
          <EmptyState
            icon={<Users className="w-10 h-10" />}
            title={t('dashboard.allCaughtUp')}
            description={t('dashboard.noAttentionNeeded')}
            className="py-8"
          />
        ) : (
          persons.slice(0, 5).map((person, index) => {
            const daysSince = getDaysSinceLastMeeting(person.lastMeetingDate)
            const daysOverdue = getDaysOverdue(person.lastMeetingDate, person.meetingFrequencyGoal)
            return (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/persons/${person.id}`)}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="relative">
                  <Avatar name={person.name} size="md" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{person.name}</p>
                  <p className="text-sm text-slate-500">
                    {daysSince === null
                      ? t('persons.neverMet')
                      : t('persons.daysAgo', { days: daysSince })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {daysOverdue > 0 && (
                    <Badge variant="warning">
                      {t('persons.daysOverdue', { days: daysOverdue })}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleScheduleMeeting(person.id, e)}
                    className="!p-2"
                  >
                    <CalendarPlus className="w-4 h-4" />
                  </Button>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </motion.div>
            )
          })
        )}
      </div>
      {persons.length > 5 && (
        <div className="p-4 border-t border-slate-200 text-center">
          <a href="/persons" className="text-sm text-primary-600 hover:text-primary-700">
            {t('dashboard.viewAll')} ({persons.length} {t('dashboard.people')})
          </a>
        </div>
      )}
    </div>
  )
}
