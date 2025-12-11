import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Mail, ChevronRight } from 'lucide-react'
import type { Person } from '@/types'
import { Avatar, Badge } from '@/components/ui'

interface PersonCardProps {
  person: Person
  index?: number
}

export function PersonCard({ person, index = 0 }: PersonCardProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/persons/${person.id}`)}
      className="card-hover w-full p-4 flex items-center gap-4 text-left"
    >
      <Avatar name={person.name} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 truncate">{person.name}</h3>
          <Badge variant={person.role === 'manager' ? 'primary' : 'default'}>
            {person.role === 'manager' ? t('persons.manager') : t('persons.teammate')}
          </Badge>
        </div>
        {person.email && (
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <Mail className="w-3 h-3" />
            {person.email}
          </p>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-slate-400" />
    </motion.button>
  )
}
