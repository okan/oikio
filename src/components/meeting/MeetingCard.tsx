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
  const displayTitle = meeting.title || formatDate(meeting.date)
  const hasActions = meeting.actionStats && meeting.actionStats.total > 0
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/meetings/${meeting.id}`)}
      className="card-hover w-full p-4 text-left group"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-stone-900 truncate text-sm">{displayTitle}</h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-stone-500">
            <Calendar className="w-3 h-3 text-stone-400" />
            <span>{formatDate(meeting.date)}</span>
            {showPerson && meeting.personName && (
              <>
                <span className="text-stone-300">·</span>
                <span>{meeting.personName}</span>
              </>
            )}
            {hasActions && (
              <>
                <span className="text-stone-300">·</span>
                <span className="flex items-center gap-0.5 text-stone-400">
                  <CheckCircle2 className="w-3 h-3" />
                  {meeting.actionStats!.completed}/{meeting.actionStats!.total}
                </span>
              </>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0" />
      </div>
    </motion.button>
  )
}
