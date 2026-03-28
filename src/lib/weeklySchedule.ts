import type { Meeting } from '@/types'

export function parseMeetingLocalDate(dateStr: string): Date {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  }
  const d = new Date(dateStr)
  d.setHours(0, 0, 0, 0)
  return d
}

function localDateKey(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${da}`
}

export function startOfISOWeekMonday(ref: Date = new Date()): Date {
  const d = new Date(ref)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const offset = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + offset)
  return d
}

export interface WeekDaySlot {
  date: Date
  dateKey: string
  isToday: boolean
}

export function getWeekSlots(anchor: Date = new Date()): WeekDaySlot[] {
  const start = startOfISOWeekMonday(anchor)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayKey = localDateKey(today)
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const dateKey = localDateKey(date)
    return { date, dateKey, isToday: dateKey === todayKey }
  })
}

export function groupMeetingsByWeekDay(
  meetings: Meeting[],
  anchor: Date = new Date()
): Map<string, Meeting[]> {
  const slots = getWeekSlots(anchor)
  const allowed = new Set(slots.map((s) => s.dateKey))
  const map = new Map<string, Meeting[]>()
  for (const s of slots) {
    map.set(s.dateKey, [])
  }
  for (const meeting of meetings) {
    const key = localDateKey(parseMeetingLocalDate(meeting.date))
    if (allowed.has(key)) {
      map.get(key)!.push(meeting)
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => {
      const ta = new Date(a.date).getTime()
      const tb = new Date(b.date).getTime()
      if (ta !== tb) return ta - tb
      return (a.personName || '').localeCompare(b.personName || '', undefined, { sensitivity: 'base' })
    })
  }
  return map
}
