import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight, CheckCircle, Circle } from 'lucide-react'
import type { Meeting } from '@/types'
import { EmptyState, Button } from '@/components/ui'
import { formatMeetingTitle } from '@/lib/utils'
import { useTemplateStore } from '@/store'
interface PersonMeetingTimelineProps {
  meetings: Meeting[]
  onAddClick: () => void
}
interface GroupedMeetings {
  [key: string]: Meeting[]
}
export function PersonMeetingTimeline({ meetings, onAddClick }: PersonMeetingTimelineProps) {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { templates } = useTemplateStore()
  if (meetings.length === 0) {
    return (
      <div className="card p-8">
        <EmptyState
          icon={<Calendar className="w-12 h-12" />}
          title={t('personDetail.noMeetings')}
          description={t('personDetail.noMeetingsDesc')}
          action={<Button onClick={onAddClick}>{t('meetings.newMeeting')}</Button>}
        />
      </div>
    )
  }
  const groupedMeetings: GroupedMeetings = meetings.reduce((groups, meeting) => {
    const date = new Date(meeting.date)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!groups[monthKey]) {
      groups[monthKey] = []
    }
    groups[monthKey].push(meeting)
    return groups
  }, {} as GroupedMeetings)
  const formatMonthYear = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1)
    return date.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
      month: 'long',
      year: 'numeric',
    })
  }
  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.getDate()
  }
  const formatDayName = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
      weekday: 'short',
    })
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-900">
            {t('personDetail.meetingHistory', { count: meetings.length })}
          </h3>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {Object.entries(groupedMeetings).map(([monthKey, monthMeetings]) => (
          <div key={monthKey}>
            <div className="px-4 py-2 bg-slate-50 sticky top-0">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {formatMonthYear(monthKey)}
              </span>
            </div>
            {monthMeetings.map((meeting, index) => {
              const hasAllActionsCompleted =
                meeting.actionStats &&
                meeting.actionStats.total > 0 &&
                meeting.actionStats.completed === meeting.actionStats.total
              const template = templates.find((t) => t.id === meeting.templateId)
              return (
                <motion.button
                  key={meeting.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => navigate(`/meetings/${meeting.id}`)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-12 text-center">
                    <div className="text-lg font-bold text-slate-900">{formatDay(meeting.date)}</div>
                    <div className="text-xs text-slate-500">{formatDayName(meeting.date)}</div>
                  </div>
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${hasAllActionsCompleted ? 'bg-green-500' : 'bg-primary-500'
                        }`}
                    />
                    {index < monthMeetings.length - 1 && (
                      <div className="absolute top-3 w-0.5 h-8 bg-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {formatMeetingTitle(meeting.title, meeting.date, i18n.language)}
                    </p>
                    {template && (
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        {template.name}
                      </p>
                    )}
                  </div>
                  {meeting.actionStats && meeting.actionStats.total > 0 && (
                    <div
                      className={`flex items-center gap-1 text-xs ${hasAllActionsCompleted ? 'text-green-600' : 'text-slate-500'
                        }`}
                    >
                      {hasAllActionsCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                      {meeting.actionStats.completed}/{meeting.actionStats.total}
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </motion.button>
              )
            })}
          </div>
        ))}
      </div>
    </motion.div>
  )
}
