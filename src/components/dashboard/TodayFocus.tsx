import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  CalendarPlus,
  Sparkles,
} from 'lucide-react'
import type { Person, Meeting, ActionItem } from '@/types'
import { Avatar, Checkbox, Badge } from '@/components/ui'
import { useActionStore } from '@/store'
import { calculateRelationshipHealth } from '@/lib/relationships'
import { isOverdue, getRelativeTime, formatMeetingTitle } from '@/lib/utils'
type FocusItemType = 'overdue_person' | 'urgent_action' | 'upcoming_meeting' | 'due_action'
interface FocusItem {
  id: string
  type: FocusItemType
  priority: number
  data: {
    person?: Person
    action?: ActionItem
    meeting?: Meeting
    daysOverdue?: number
  }
}
function prioritizeItems(
  persons: Person[],
  actions: ActionItem[],
  meetings: Meeting[]
): FocusItem[] {
  const items: FocusItem[] = []
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  persons.forEach((person) => {
    const health = calculateRelationshipHealth(person)
    if (health.status === 'critical' && health.isOverdue) {
      const hasFutureMeeting = meetings.some((m) => {
        const meetingDate = new Date(m.date)
        meetingDate.setHours(0, 0, 0, 0)
        return m.personId === person.id && meetingDate > todayStart
      })
      if (!hasFutureMeeting) {
        items.push({
          id: `person-${person.id}`,
          type: 'overdue_person',
          priority: 100 + health.daysOverdue,
          data: { person, daysOverdue: health.daysOverdue },
        })
      }
    }
  })
  actions
    .filter((a) => !a.completed && a.dueDate && isOverdue(a.dueDate))
    .forEach((action) => {
      const dueDate = new Date(action.dueDate!)
      const today = new Date()
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      items.push({
        id: `action-overdue-${action.id}`,
        type: 'urgent_action',
        priority: 90 + daysOverdue,
        data: { action },
      })
    })
  actions
    .filter((a) => {
      if (a.completed || !a.dueDate) return false
      const dueDate = new Date(a.dueDate)
      const today = new Date()
      const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return daysUntil >= 0 && daysUntil <= 2
    })
    .forEach((action) => {
      const dueDate = new Date(action.dueDate!)
      const today = new Date()
      const daysUntil = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      items.push({
        id: `action-soon-${action.id}`,
        type: 'due_action',
        priority: 70 - daysUntil,
        data: { action },
      })
    })
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  meetings
    .filter((m) => {
      const meetingDate = new Date(m.date)
      meetingDate.setHours(0, 0, 0, 0)
      return meetingDate >= today && meetingDate < tomorrow
    })
    .forEach((meeting) => {
      items.push({
        id: `meeting-${meeting.id}`,
        type: 'upcoming_meeting',
        priority: 80,
        data: { meeting },
      })
    })
  return items.sort((a, b) => b.priority - a.priority).slice(0, 5)
}
export function TodayFocus() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { toggleComplete } = useActionStore()
  const [items, setItems] = useState<FocusItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [persons, actions, meetings] = await Promise.all([
          window.api.persons.getAll(),
          window.api.actions.getPending(),
          window.api.meetings.getUpcoming(365),
        ])
        const prioritized = prioritizeItems(persons, actions, meetings)
        setItems(prioritized)
      } catch (error) {
        console.error('Error loading focus items:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])
  const handleToggleAction = async (actionId: number) => {
    await toggleComplete(actionId)
    setItems((prev) => prev.filter((item) => item.data.action?.id !== actionId))
  }
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-green-100 hover:border-green-200 transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-medium text-green-800">{t('focus.allClear')}</span>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                {t('focus.noOverduePersons')}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                {t('focus.noOverdueActions')}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                {t('focus.noTodayMeetings')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
  const getItemIcon = (type: FocusItemType) => {
    switch (type) {
      case 'overdue_person':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'urgent_action':
        return <Clock className="w-4 h-4 text-red-500" />
      case 'upcoming_meeting':
        return <Calendar className="w-4 h-4 text-primary-500" />
      case 'due_action':
        return <CheckCircle2 className="w-4 h-4 text-amber-500" />
    }
  }
  const getItemBgColor = (type: FocusItemType) => {
    switch (type) {
      case 'overdue_person':
      case 'urgent_action':
        return 'bg-red-50 hover:bg-red-100 border-red-100'
      case 'upcoming_meeting':
        return 'bg-primary-50 hover:bg-primary-100 border-primary-100'
      case 'due_action':
        return 'bg-amber-50 hover:bg-amber-100 border-amber-100'
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{t('focus.title')}</h2>
            <p className="text-xs text-slate-500">{t('focus.subtitle')}</p>
          </div>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl border p-3 transition-colors ${getItemBgColor(item.type)}`}
            >
              {item.type === 'overdue_person' && item.data.person && (
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/persons/${item.data.person!.id}`)}
                >
                  <Avatar name={item.data.person.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {item.data.person.name}
                    </p>
                    <p className="text-xs text-red-600">
                      {t('focus.overdueBy', { days: item.data.daysOverdue })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/meetings?new=true&personId=${item.data.person!.id}`)
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                  >
                    <CalendarPlus className="w-3 h-3" />
                    {t('focus.schedule')}
                  </button>
                </div>
              )}
              {(item.type === 'urgent_action' || item.type === 'due_action') &&
                item.data.action && (
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={false}
                      onCheckedChange={() => handleToggleAction(item.data.action!.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">
                        {item.data.action.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">
                          {item.data.action.personName}
                        </span>
                        {item.data.action.dueDate && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span
                              className={`text-xs flex items-center gap-1 ${isOverdue(item.data.action.dueDate)
                                ? 'text-red-600'
                                : 'text-amber-600'
                                }`}
                            >
                              {getItemIcon(item.type)}
                              {getRelativeTime(item.data.action.dueDate)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {item.type === 'urgent_action' && (
                      <Badge variant="error" size="sm">
                        {t('focus.overdue')}
                      </Badge>
                    )}
                  </div>
                )}
              {item.type === 'upcoming_meeting' && item.data.meeting && (
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => navigate(`/meetings/${item.data.meeting!.id}`)}
                >
                  <Avatar name={item.data.meeting.personName || ''} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">
                      {formatMeetingTitle(item.data.meeting.title, item.data.meeting.date)}
                    </p>
                    <p className="text-xs text-slate-500">{item.data.meeting.personName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {t('focus.today')}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
