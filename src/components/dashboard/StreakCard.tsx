import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import type { Meeting, ActionItem } from '@/types'
interface StreakData {
  currentStreak: number
  longestStreak: number
  weeklyMeetings: number
  weeklyActions: number
  weeklyGoal: number
  badges: Badge[]
}
interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earned: boolean
}
function calculateStreakData(meetings: Meeting[], actions: ActionItem[]): StreakData {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const activityDays = new Set<string>()
  meetings.forEach((m) => {
    const date = new Date(m.createdAt).toISOString().split('T')[0]
    activityDays.add(date)
  })
  actions.forEach((a) => {
    if (a.completed) {
      const date = new Date(a.createdAt).toISOString().split('T')[0]
      activityDays.add(date)
    }
  })
  let currentStreak = 0
  const checkDate = new Date(today)
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0]
    if (activityDays.has(dateStr)) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (checkDate.getTime() === today.getTime()) {
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  const sortedDays = Array.from(activityDays).sort()
  let longestStreak = 0
  let tempStreak = 1
  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1])
    const curr = new Date(sortedDays[i])
    const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diffDays === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak)
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weeklyMeetings = meetings.filter((m) => {
    const date = new Date(m.createdAt)
    return date >= weekStart && date <= today
  }).length
  const weeklyActions = actions.filter((a) => {
    if (!a.completed) return false
    const date = new Date(a.createdAt)
    return date >= weekStart && date <= today
  }).length
  const badges: Badge[] = [
    {
      id: 'first-meeting',
      name: 'İlk Adım',
      description: 'İlk toplantı notunu oluştur',
      icon: '🎯',
      earned: meetings.length >= 1,
    },
    {
      id: 'week-streak',
      name: 'Haftalık Seri',
      description: '7 gün üst üste aktif ol',
      icon: '🔥',
      earned: longestStreak >= 7,
    },
    {
      id: 'ten-meetings',
      name: '10 Toplantı',
      description: '10 toplantı notu oluştur',
      icon: '📝',
      earned: meetings.length >= 10,
    },
    {
      id: 'action-hero',
      name: 'Aksiyon Kahramanı',
      description: '25 aksiyon tamamla',
      icon: '⚡',
      earned: actions.filter((a) => a.completed).length >= 25,
    },
    {
      id: 'consistent',
      name: 'Tutarlılık',
      description: '30 gün seri yap',
      icon: '🏆',
      earned: longestStreak >= 30,
    },
  ]
  return {
    currentStreak,
    longestStreak,
    weeklyMeetings,
    weeklyActions,
    weeklyGoal: 3,
    badges,
  }
}
export function StreakCard() {
  const { t } = useTranslation()
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [meetings, actions] = await Promise.all([
          window.api.meetings.getAll(),
          window.api.actions.getAll(),
        ])
        const data = calculateStreakData(meetings, actions)
        setStreakData(data)
      } catch (error) {
        console.error('Error loading streak data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])
  if (isLoading || !streakData) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-16 bg-slate-200 rounded" />
        </div>
      </div>
    )
  }
  const weeklyProgress = Math.min(
    100,
    Math.round((streakData.weeklyMeetings / streakData.weeklyGoal) * 100)
  )
  const earnedBadges = streakData.badges.filter((b) => b.earned)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500" />
        <h2 className="font-semibold text-slate-900">{t('streak.title')}</h2>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {streakData.currentStreak}
          </div>
          <div className="text-xs text-orange-700">{t('streak.currentStreak')}</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 text-center">
          <div className="text-3xl font-bold text-slate-700">
            {streakData.weeklyMeetings}/{streakData.weeklyGoal}
          </div>
          <div className="text-xs text-slate-500">{t('streak.weeklyGoal')}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <div className="text-3xl font-bold text-amber-600">
            {streakData.longestStreak}
          </div>
          <div className="text-xs text-amber-700">{t('streak.longestStreak')}</div>
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">{t('streak.weeklyProgress')}</span>
          <span className="text-xs font-medium text-slate-700">{weeklyProgress}%</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weeklyProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-primary-500"
          />
        </div>
      </div>
      {earnedBadges.length > 0 && (
        <div>
          <div className="text-xs text-slate-500 mb-2">{t('streak.badges')}</div>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                title={badge.description}
                className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-full"
              >
                <span>{badge.icon}</span>
                <span className="text-xs font-medium text-amber-700">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
