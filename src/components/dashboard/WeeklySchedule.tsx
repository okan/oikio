import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import type { Meeting } from '@/types'
import { Avatar } from '@/components/ui'
import { formatMeetingTitle, formatDateShort, cn } from '@/lib/utils'
import { getWeekSlots, groupMeetingsByWeekDay } from '@/lib/weeklySchedule'

interface WeeklyScheduleProps {
  meetings: Meeting[]
  isLoading?: boolean
}
export function WeeklySchedule({ meetings, isLoading }: WeeklyScheduleProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = i18n.language === 'tr' ? 'tr-TR' : 'en-US'
  const columns = useMemo(() => {
    const anchor = new Date()
    const slots = getWeekSlots(anchor)
    const byDay = groupMeetingsByWeekDay(meetings, anchor)
    return slots.map((slot) => ({
      ...slot,
      meetings: byDay.get(slot.dateKey) ?? [],
    }))
  }, [meetings])
  const weekStart = columns[0]?.date
  const weekEnd = columns[6]?.date
  const weekRangeLabel =
    weekStart && weekEnd
      ? `${formatDateShort(weekStart, i18n.language)} – ${formatDateShort(weekEnd, i18n.language)}`
      : ''
  const totalThisWeek = columns.reduce((n, c) => n + c.meetings.length, 0)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-stone-100 flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-stone-500 shrink-0" />
          <div>
            <h2 className="text-sm font-semibold text-stone-900">{t('dashboard.weekSchedule')}</h2>
            {weekRangeLabel && (
              <p className="text-xs text-stone-500 mt-0.5">{weekRangeLabel}</p>
            )}
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="p-5 grid grid-cols-7 gap-2 animate-pulse">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-10 bg-stone-100 rounded-lg" />
              <div className="h-16 bg-stone-50 rounded-lg" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="grid grid-flow-col auto-cols-[minmax(7.5rem,1fr)] md:grid-cols-7 gap-0 min-w-0 divide-x divide-stone-100">
              {columns.map((col, colIndex) => (
                <div
                  key={col.dateKey}
                  className={cn(
                    'px-2 py-3 md:px-3 flex flex-col min-h-[8rem]',
                    col.isToday && 'bg-amber-50/50'
                  )}
                >
                  <div
                    className={cn(
                      'text-center pb-2 mb-2 border-b border-stone-100',
                      col.isToday && 'border-amber-200'
                    )}
                  >
                    <p className="text-[10px] font-medium uppercase tracking-wide text-stone-400">
                      {col.date.toLocaleDateString(locale, { weekday: 'short' })}
                    </p>
                    <p
                      className={cn(
                        'text-lg font-semibold tabular-nums',
                        col.isToday ? 'text-amber-900' : 'text-stone-800'
                      )}
                    >
                      {col.date.getDate()}
                    </p>
                    {col.isToday && (
                      <span className="text-[10px] font-medium text-amber-700">{t('focus.today')}</span>
                    )}
                  </div>
                  <ul className="flex-1 space-y-1.5" aria-label={col.date.toLocaleDateString(locale)}>
                    {col.meetings.map((meeting, i) => (
                      <li key={meeting.id}>
                        <motion.button
                          type="button"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: colIndex * 0.02 + i * 0.03 }}
                          onClick={() => navigate(`/meetings/${meeting.id}`)}
                          className={cn(
                            'w-full text-left rounded-lg border border-stone-200 bg-white p-2',
                            'hover:border-stone-300 hover:bg-stone-50 transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1'
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <Avatar
                              name={meeting.personName || '?'}
                              size="sm"
                              className="w-7 h-7 text-[10px] shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium text-stone-900 truncate">
                                {meeting.personName || '—'}
                              </p>
                              <p className="text-[10px] text-stone-500 line-clamp-2 leading-snug mt-0.5">
                                {formatMeetingTitle(meeting.title, meeting.date, i18n.language)}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          {totalThisWeek === 0 && (
            <p className="text-center text-xs text-stone-500 py-3 px-4 border-t border-stone-100 bg-stone-50/50">
              {t('dashboard.weekScheduleEmpty')}
            </p>
          )}
        </>
      )}
    </motion.div>
  )
}
