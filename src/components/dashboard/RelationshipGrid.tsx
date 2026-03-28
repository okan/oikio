import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Users, ChevronRight, UserPlus, CalendarCheck } from 'lucide-react'
import type { Person, Meeting } from '@/types'
import { Avatar, Button } from '@/components/ui'
import {
  calculateRelationshipHealth,
  getHealthTextColor,
} from '@/lib/relationships'
interface RelationshipGridProps {
  persons: Person[]
  futureMeetings: Meeting[]
}
export function RelationshipGrid({ persons: rawPersons, futureMeetings }: RelationshipGridProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const persons = useMemo(
    () => [...rawPersons].sort((a, b) => {
      const healthA = calculateRelationshipHealth(a)
      const healthB = calculateRelationshipHealth(b)
      return healthA.score - healthB.score
    }),
    [rawPersons]
  )
  if (persons.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 text-center h-full flex flex-col items-center justify-center"
      >
        <div className="w-12 h-12 mx-auto mb-3 bg-stone-100 rounded-xl flex items-center justify-center">
          <Users className="w-6 h-6 text-stone-400" />
        </div>
        <h3 className="font-medium text-stone-800 mb-1">{t('relationship.noPeople')}</h3>
        <p className="text-xs text-stone-500 mb-3">{t('relationship.addFirst')}</p>
        <Button onClick={() => navigate('/persons?new=true')} size="sm">
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          {t('dashboard.newPerson')}
        </Button>
      </motion.div>
    )
  }
  const getLastMeetingText = (daysSince: number | null) => {
    if (daysSince === null) return t('relationship.neverMet')
    if (daysSince === 0) return t('relationship.today')
    if (daysSince === 1) return t('relationship.yesterday')
    return t('relationship.daysAgo', { days: daysSince })
  }
  const getPersonFutureMeeting = (personId: number) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return futureMeetings.find((m) => {
      const meetingDate = new Date(m.date)
      meetingDate.setHours(0, 0, 0, 0)
      return m.personId === personId && meetingDate > today
    })
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card overflow-hidden h-full flex flex-col"
    >
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-stone-400" />
          <h2 className="text-sm font-medium text-stone-500">{t('relationship.title')}</h2>
        </div>
        <button
          onClick={() => navigate('/persons')}
          className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-0.5 transition-colors"
        >
          {t('dashboard.viewAll')}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 px-5 pb-3 space-y-1">
        {persons.slice(0, 4).map((person, index) => {
          const health = calculateRelationshipHealth(person)
          return (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/persons/${person.id}`)}
              className="flex items-center gap-2.5 p-2 -mx-2 rounded-lg hover:bg-stone-50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <Avatar name={person.name} size="sm" />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${health.status === 'critical'
                    ? 'bg-red-500'
                    : health.status === 'warning'
                      ? 'bg-amber-500'
                      : health.status === 'neutral'
                        ? 'bg-stone-400'
                        : 'bg-emerald-500'
                    }`}
                />
              </div>
              <p className="flex-1 font-medium text-stone-800 text-sm truncate">
                {person.name}
              </p>
              {(() => {
                const futureMeeting = getPersonFutureMeeting(person.id)
                if (futureMeeting) {
                  return (
                    <span className="text-[11px] text-blue-600 flex items-center gap-0.5">
                      <CalendarCheck className="w-3 h-3" />
                    </span>
                  )
                }
                return (
                  <span className={`text-[11px] ${getHealthTextColor(health.status)}`}>
                    {getLastMeetingText(health.daysSinceLastMeeting)}
                  </span>
                )
              })()}
            </motion.div>
          )
        })}
      </div>
      {persons.length > 4 && (
        <div className="px-5 pb-4">
          <button
            onClick={() => navigate('/persons')}
            className="w-full py-1.5 text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
          >
            +{persons.length - 4} {t('common.more')}
          </button>
        </div>
      )}
    </motion.div>
  )
}
