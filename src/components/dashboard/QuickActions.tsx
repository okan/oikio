import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { UserPlus, CalendarPlus } from 'lucide-react'
export function QuickActions() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const actions = [
    {
      icon: UserPlus,
      label: t('dashboard.newPerson'),
      description: t('dashboard.addManagerOrTeammate'),
      onClick: () => navigate('/persons?new=true'),
      color: 'bg-emerald-500',
    },
    {
      icon: CalendarPlus,
      label: t('dashboard.newMeeting'),
      description: t('dashboard.createMeetingNote'),
      onClick: () => navigate('/meetings?new=true'),
      color: 'bg-primary-500',
    },
  ]
  return (
    <div className="grid grid-cols-2 gap-4">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={action.onClick}
          className="card-hover p-6 text-left group"
        >
          <div
            className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
          >
            <action.icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-slate-900">{action.label}</h3>
          <p className="text-sm text-slate-500 mt-1">{action.description}</p>
        </motion.button>
      ))}
    </div>
  )
}
