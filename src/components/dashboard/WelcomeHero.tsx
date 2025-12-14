import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Flame, Trophy, UserPlus, CalendarPlus } from 'lucide-react'
import { BadgesModal, type Badge } from './BadgesModal'
import type { Meeting, ActionItem } from '@/types'
interface StreakData {
  currentStreak: number
  longestStreak: number
  weeklyMeetings: number
  weeklyGoal: number
  badges: Badge[]
}
function calculateStreakData(meetings: Meeting[], actions: ActionItem[]): StreakData {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const activityDays = new Set<string>()
  meetings.forEach((m) => {
    const meetingDate = new Date(m.date)  
    if (meetingDate > today) return
    const date = meetingDate.toISOString().split('T')[0]
    activityDays.add(date)
  })
  actions.forEach((a) => {
    if (a.completed) {
      const date = new Date(a.createdAt).toISOString().split('T')[0]
      activityDays.add(date)
    }
  })
  let currentStreak = 0
  let checkDate = new Date(today)
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
  if (sortedDays.length > 0) {
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
  }
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  const weeklyMeetings = meetings.filter((m) => {
    const date = new Date(m.createdAt)
    return date >= weekStart && date <= today
  }).length
  const badges: Badge[] = [
    {
      id: 'first-meeting',
      name: 'İlk Adım',
      descriptionKey: 'firstMeeting_desc',
      icon: '🎯',
      earned: meetings.length >= 1,
    },
    {
      id: 'week-streak',
      name: 'Haftalık Seri',
      descriptionKey: 'weekStreak_desc',
      icon: '🔥',
      earned: longestStreak >= 7,
    },
    {
      id: 'ten-meetings',
      name: '10 Toplantı',
      descriptionKey: 'tenMeetings_desc',
      icon: '📝',
      earned: meetings.length >= 10,
    },
    {
      id: 'action-hero',
      name: 'Aksiyon Kahramanı',
      descriptionKey: 'actionHero_desc',
      icon: '⚡',
      earned: actions.filter((a) => a.completed).length >= 25,
    },
    {
      id: 'consistent',
      name: 'Tutarlılık',
      descriptionKey: 'consistent_desc',
      icon: '🏆',
      earned: longestStreak >= 30,
    },
  ]
  return {
    currentStreak,
    longestStreak,
    weeklyMeetings,
    weeklyGoal: 3,
    badges,
  }
}
export function WelcomeHero() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [badgesModalOpen, setBadgesModalOpen] = useState(false)
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
  if (isLoading) {
    return (
      <div className="card p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-12 bg-slate-200 rounded" />
        </div>
      </div>
    )
  }
  const weeklyProgress = streakData
    ? Math.min(100, Math.round((streakData.weeklyMeetings / streakData.weeklyGoal) * 100))
    : 0
  const earnedBadges = streakData?.badges.filter((b) => b.earned) || []
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6 bg-gradient-to-br from-white to-slate-50"
    >
      { }
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('dashboard.welcome')} 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {t('dashboard.summary')}
          </p>
        </div>
        { }
        <div
          className="flex gap-1 cursor-pointer hover:bg-slate-50 p-1 rounded-xl transition-colors"
          onClick={() => setBadgesModalOpen(true)}
        >
          {earnedBadges.length > 0 ? (
            <>
              {earnedBadges.slice(0, 3).map((badge) => (
                <div
                  key={badge.id}
                  title={badge.name}
                  className="w-8 h-8 flex items-center justify-center bg-amber-50 rounded-full text-lg hover:scale-110 transition-transform cursor-pointer"
                >
                  {badge.icon}
                </div>
              ))}
              {earnedBadges.length > 3 && (
                <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                  +{earnedBadges.length - 3}
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-100 rounded-lg">
              {t('streak.viewAll')}
            </div>
          )}
        </div>
      </div>
      { }
      {streakData && (
        <div className="flex items-center gap-6 mb-6 py-3 px-4 bg-slate-50 rounded-xl">
          { }
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-lg font-bold text-orange-600">{streakData.currentStreak}</span>
            <span className="text-sm text-slate-500">{t('streak.currentStreak')}</span>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          { }
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-lg font-bold text-amber-600">{streakData.longestStreak}</span>
            <span className="text-sm text-slate-500">{t('streak.longestStreak')}</span>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          { }
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm text-slate-500">{t('streak.weeklyProgress')}</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden max-w-[200px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${weeklyProgress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-primary-500"
              />
            </div>
            <span className="text-sm font-medium text-slate-700">
              {streakData.weeklyMeetings}/{streakData.weeklyGoal}
            </span>
          </div>
        </div>
      )}
      { }
      <div className="flex gap-3">
        <button
          onClick={() => navigate('/persons?new=true')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          {t('dashboard.newPerson')}
        </button>
        <button
          onClick={() => navigate('/meetings?new=true')}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
        >
          <CalendarPlus className="w-4 h-4" />
          {t('dashboard.newMeeting')}
        </button>
      </div>
      {streakData && (
        <BadgesModal
          open={badgesModalOpen}
          onOpenChange={setBadgesModalOpen}
          badges={streakData.badges}
        />
      )}
    </motion.div>
  )
}
