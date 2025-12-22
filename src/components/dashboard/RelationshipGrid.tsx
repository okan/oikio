import { useEffect, useState } from 'react'
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
export function RelationshipGrid() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [persons, setPersons] = useState<Person[]>([])
  const [futureMeetings, setFutureMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const loadPersons = async () => {
      try {
        const [personsData, meetingsData] = await Promise.all([
          window.api.persons.getAll(),
          window.api.meetings.getUpcoming(365),
        ])
        const sorted = personsData.sort((a, b) => {
          const healthA = calculateRelationshipHealth(a)
          const healthB = calculateRelationshipHealth(b)
          return healthA.score - healthB.score
        })
        setPersons(sorted)
        setFutureMeetings(meetingsData)
      } catch (error) {
        console.error('Error loading persons:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPersons()
  }, [])
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (persons.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 text-center"
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="font-semibold text-slate-900 mb-1">{t('relationship.noPeople')}</h3>
        <p className="text-sm text-slate-500 mb-4">{t('relationship.addFirst')}</p>
        <Button onClick={() => navigate('/persons?new=true')}>
          <UserPlus className="w-4 h-4 mr-2" />
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{t('relationship.title')}</h2>
            <p className="text-xs text-slate-500">
              {t('relationship.subtitle', { count: persons.length })}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/persons')}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          {t('dashboard.viewAll')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="divide-y divide-slate-100">
        {persons.slice(0, 3).map((person, index) => {
          const health = calculateRelationshipHealth(person)
          return (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/persons/${person.id}`)}
              className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="relative">
                <Avatar name={person.name} size="sm" />
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${health.status === 'critical'
                    ? 'bg-red-500'
                    : health.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                    }`}
                />
              </div>
              <p className="flex-1 font-medium text-slate-900 text-sm truncate">
                {person.name}
              </p>
              {(() => {
                const futureMeeting = getPersonFutureMeeting(person.id)
                if (futureMeeting) {
                  return (
                    <span className="text-xs text-primary-600 flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3" />
                      {t('relationship.scheduled')}
                    </span>
                  )
                }
                return (
                  <span className={`text-xs ${getHealthTextColor(health.status)}`}>
                    {getLastMeetingText(health.daysSinceLastMeeting)}
                  </span>
                )
              })()}
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </motion.div>
          )
        })}
      </div>
      {persons.length > 3 && (
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => navigate('/persons')}
            className="w-full py-1.5 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            +{persons.length - 3} {t('common.more')}
          </button>
        </div>
      )}
    </motion.div>
  )
}
