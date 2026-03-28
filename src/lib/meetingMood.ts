import type { MeetingMood } from '@/types'

export const MEETING_MOOD_EMOJI: Record<MeetingMood, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
}

export function getMeetingMoodEmoji(mood: MeetingMood | undefined): string | null {
  if (mood == null || !(mood in MEETING_MOOD_EMOJI)) return null
  return MEETING_MOOD_EMOJI[mood]
}
