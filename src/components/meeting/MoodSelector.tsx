import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { MeetingMood } from '@/types'
import { cn } from '@/lib/utils'
import { MEETING_MOOD_EMOJI } from '@/lib/meetingMood'

const MOOD_LEVELS: MeetingMood[] = [1, 2, 3, 4, 5]

interface MoodSelectorProps {
  value: MeetingMood | undefined
  onChange: (mood: MeetingMood | undefined) => void | Promise<void>
  disabled?: boolean
  className?: string
  compact?: boolean
}
export function MoodSelector({
  value,
  onChange,
  disabled,
  className,
  compact,
}: MoodSelectorProps) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const handlePick = async (level: MeetingMood) => {
    if (disabled || busy) return
    const next = value === level ? undefined : level
    setBusy(true)
    try {
      await onChange(next)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'text-stone-500',
            compact ? 'text-[10px] uppercase tracking-wide' : 'text-xs font-medium uppercase tracking-wide',
          )}
        >
          {t('meetings.moodLabel')}
        </span>
      </div>
      <div className={cn('flex flex-wrap items-center gap-1', compact && 'gap-0.5')}>
        {MOOD_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            disabled={disabled || busy}
            onClick={() => handlePick(level)}
            className={cn(
              'rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1 disabled:opacity-50',
              compact ? 'px-1 py-0.5 text-base' : 'px-1.5 py-1 text-xl',
              value === level
                ? 'border-amber-400 bg-amber-50 shadow-sm'
                : 'border-transparent bg-stone-50 hover:bg-stone-100',
            )}
            aria-label={t('meetings.moodAria', { level })}
            aria-pressed={value === level}
          >
            <span aria-hidden>{MEETING_MOOD_EMOJI[level]}</span>
          </button>
        ))}
      </div>
      {value != null && !compact && (
        <button
          type="button"
          disabled={disabled || busy}
          onClick={async () => {
            if (disabled || busy) return
            setBusy(true)
            try {
              await onChange(undefined)
            } finally {
              setBusy(false)
            }
          }}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          {t('meetings.moodClear')}
        </button>
      )}
    </div>
  )
}
