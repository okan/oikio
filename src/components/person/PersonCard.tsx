import { memo, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ChevronRight, CalendarCheck } from 'lucide-react'
import type { Person, Meeting } from '@/types'
import { Avatar, Badge } from '@/components/ui'
import {
  calculateRelationshipHealth,
  getHealthColor,
  getHealthTextColor,
  getDaysSinceLastMeeting,
} from '@/lib/relationships'
import { cn } from '@/lib/utils'
interface PersonCardProps {
  person: Person
  index?: number
  futureMeeting?: Meeting
}
export const PersonCard = memo(function PersonCard({ person, index = 0, futureMeeting }: PersonCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const health = useMemo(() => calculateRelationshipHealth(person), [person])
  const daysSince = useMemo(() => getDaysSinceLastMeeting(person.lastMeetingDate), [person.lastMeetingDate])
  const getLastMeetingText = () => {
    if (daysSince === null) return t('relationship.neverMet')
    if (daysSince === 0) return t('relationship.today')
    if (daysSince === 1) return t('relationship.yesterday')
    return t('relationship.daysAgo', { days: daysSince })
  }
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/persons/${person.id}`)}
      className="card-hover w-full p-4 flex items-center gap-4 text-left"
    >
      { }
      <div className="relative">
        <Avatar name={person.name} size="lg" />
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white',
            getHealthColor(health.status)
          )}
        />
      </div>
      { }
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 truncate">{person.name}</h3>
          <Badge variant={person.role === 'manager' ? 'primary' : 'default'}>
            {person.role === 'manager' ? t('persons.manager') : t('persons.teammate')}
          </Badge>
        </div>
      </div>
      { }
      <div className="text-right">
        {futureMeeting ? (
          <span className="text-sm font-medium text-primary-600 flex items-center gap-1">
            <CalendarCheck className="w-4 h-4" />
            {t('relationship.scheduled')}
          </span>
        ) : (
          <span className={cn('text-sm font-medium', getHealthTextColor(health.status))}>
            {getLastMeetingText()}
          </span>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-slate-400" />
    </motion.button>
  )
})
