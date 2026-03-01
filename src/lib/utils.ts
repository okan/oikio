import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
const LOCALE_MAP: Record<string, string> = { tr: 'tr-TR', en: 'en-US' }

function resolveLocale(locale: string = 'tr'): string {
  return LOCALE_MAP[locale] || LOCALE_MAP.en
}

export function formatDate(date: string | Date, locale?: string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(resolveLocale(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}
export function formatDateShort(date: string | Date, locale?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(resolveLocale(locale), {
    month: 'short',
    day: 'numeric',
  })
}
const RELATIVE_STRINGS: Record<string, Record<string, string>> = {
  tr: { today: 'Bugün', tomorrow: 'Yarın', yesterday: 'Dün', inDays: '{n} gün sonra', daysAgo: '{n} gün önce' },
  en: { today: 'Today', tomorrow: 'Tomorrow', yesterday: 'Yesterday', inDays: 'in {n} days', daysAgo: '{n} days ago' },
}

export function getRelativeTime(date: string | Date, locale: string = 'tr'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInMs = d.getTime() - now.getTime()
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24))
  const strings = RELATIVE_STRINGS[locale] || RELATIVE_STRINGS.en
  if (diffInDays === 0) return strings.today
  if (diffInDays === 1) return strings.tomorrow
  if (diffInDays === -1) return strings.yesterday
  if (diffInDays > 0 && diffInDays <= 7) return strings.inDays.replace('{n}', String(diffInDays))
  if (diffInDays < 0 && diffInDays >= -7) return strings.daysAgo.replace('{n}', String(Math.abs(diffInDays)))
  return formatDateShort(d, locale)
}
export function isOverdue(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return d < today
}
export function toInputDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
export function formatMeetingTitle(title: string | undefined, date: string, locale: string = 'tr'): string {
  if (title) return title
  const d = new Date(date)
  return d.toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  })
}
