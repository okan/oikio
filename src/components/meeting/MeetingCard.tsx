import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight, CheckCircle2 } from 'lucide-react'
import type { Meeting } from '@/types'
import { formatDate } from '@/lib/utils'

interface MeetingCardProps {
  meeting: Meeting
  index?: number
  showPerson?: boolean
}

export function MeetingCard({ meeting, index = 0, showPerson = true }: MeetingCardProps) {
  const navigate = useNavigate()

  // Başlık yoksa tarihi kullan
  const displayTitle = meeting.title || formatDate(meeting.date)

  const hasActions = meeting.actionStats && meeting.actionStats.total > 0

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/meetings/${meeting.id}`)}
      className="card-hover w-full p-4 text-left"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{displayTitle}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(meeting.date)}</span>
            {showPerson && meeting.personName && (
              <>
                <span className="text-slate-300">•</span>
                <span>{meeting.personName}</span>
              </>
            )}
            {hasActions && (
              <>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {meeting.actionStats!.completed}/{meeting.actionStats!.total}
                </span>
              </>
            )}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
      </div>
    </motion.button>
  )
}
