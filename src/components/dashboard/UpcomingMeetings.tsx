import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight } from 'lucide-react'
import type { Meeting } from '@/types'
import { Avatar, EmptyState } from '@/components/ui'
import { getRelativeTime, formatDateShort } from '@/lib/utils'

interface UpcomingMeetingsProps {
  meetings: Meeting[]
}

export function UpcomingMeetings({ meetings }: UpcomingMeetingsProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="card">
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-900">{t('dashboard.upcomingMeetings')}</h2>
        <p className="text-sm text-slate-500">{t('dashboard.next7Days')}</p>
      </div>

      <div className="divide-y divide-slate-100">
        {meetings.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-10 h-10" />}
            title={t('dashboard.noUpcoming')}
            description={t('dashboard.noUpcomingDesc')}
            className="py-8"
          />
        ) : (
          meetings.map((meeting, index) => (
            <motion.button
              key={meeting.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/meetings/${meeting.id}`)}
              className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left"
            >
              <Avatar name={meeting.personName || ''} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{meeting.title}</p>
                <p className="text-sm text-slate-500">{meeting.personName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-primary-600">
                  {getRelativeTime(meeting.date)}
                </p>
                <p className="text-xs text-slate-500">{formatDateShort(meeting.date)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </motion.button>
          ))
        )}
      </div>
    </div>
  )
}
