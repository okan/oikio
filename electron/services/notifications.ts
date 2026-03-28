import { Notification, app } from 'electron'
import path from 'path'
import fs from 'fs'
import { DatabaseService } from './database/index'
export interface NotificationSettings {
  enabled: boolean
  meetingReminders: boolean
  actionReminders: boolean
  reminderHoursBefore: number
}
const defaultSettings: NotificationSettings = {
  enabled: true,
  meetingReminders: true,
  actionReminders: true,
  reminderHoursBefore: 24,
}
const i18nStrings: Record<string, Record<string, string>> = {
  tr: {
    meetingReminder: 'Toplantı Hatırlatıcı',
    meetingBody: '{person} ile "{title}" toplantınız {time} sonra.',
    hour1: '1 saat',
    hours: '{n} saat',
    actionReminder: 'Aksiyon Hatırlatıcı',
    overdueActions: '{n} gecikmiş aksiyon.',
    dueTodayActions: '{n} aksiyon bugün bitmeli.',
    dueTomorrowActions: '{n} aksiyon yarın bitmeli.',
    testTitle: 'Oikio Test',
    testBody: 'Bildirimler düzgün çalışıyor!',
  },
  en: {
    meetingReminder: 'Meeting Reminder',
    meetingBody: 'Meeting "{title}" with {person} in {time}.',
    hour1: '1 hour',
    hours: '{n} hours',
    actionReminder: 'Action Reminder',
    overdueActions: '{n} overdue action(s).',
    dueTodayActions: '{n} action(s) due today.',
    dueTomorrowActions: '{n} action(s) due tomorrow.',
    testTitle: 'Oikio Test',
    testBody: 'Notifications are working correctly!',
  },
}
function getLocaleStrings(): Record<string, string> {
  const locale = app.getLocale().startsWith('tr') ? 'tr' : 'en'
  return i18nStrings[locale]
}
type NotificationSentState = {
  meetingReminderIds?: string[]
  lastActionSummaryDate?: string
}

function localDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export class NotificationService {
  private db: DatabaseService
  private settings: NotificationSettings
  private checkInterval: NodeJS.Timeout | null = null
  private sentMeetingReminderIds: Set<string> = new Set()
  private lastActionSummaryDate: string | undefined
  constructor(db: DatabaseService) {
    this.db = db
    this.settings = this.loadSettings()
    this.loadSentState()
  }
  private get settingsPath(): string {
    return path.join(app.getPath('userData'), 'oikio-notification-settings.json')
  }
  private get sentStatePath(): string {
    return path.join(app.getPath('userData'), 'oikio-notification-state.json')
  }
  private loadSentState(): void {
    try {
      if (fs.existsSync(this.sentStatePath)) {
        const raw = JSON.parse(fs.readFileSync(this.sentStatePath, 'utf-8')) as NotificationSentState
        this.sentMeetingReminderIds = new Set(raw.meetingReminderIds || [])
        this.lastActionSummaryDate = raw.lastActionSummaryDate
      }
    } catch {
      this.sentMeetingReminderIds = new Set()
      this.lastActionSummaryDate = undefined
    }
  }
  private persistSentState(): void {
    try {
      fs.writeFileSync(
        this.sentStatePath,
        JSON.stringify(
          {
            meetingReminderIds: [...this.sentMeetingReminderIds],
            lastActionSummaryDate: this.lastActionSummaryDate,
          },
          null,
          2
        ),
        'utf-8'
      )
    } catch (error) {
      console.error('Error saving notification sent state:', error)
    }
  }
  private pruneStaleMeetingReminderIds(): void {
    const byId = new Map(this.db.getAllMeetings().map((m) => [String(m.id), m]))
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    for (const id of [...this.sentMeetingReminderIds]) {
      const meeting = byId.get(id)
      if (!meeting) {
        this.sentMeetingReminderIds.delete(id)
        continue
      }
      const day = new Date(meeting.date)
      day.setHours(0, 0, 0, 0)
      if (day.getTime() < startOfToday.getTime()) {
        this.sentMeetingReminderIds.delete(id)
      }
    }
  }
  private loadSettings(): NotificationSettings {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const content = fs.readFileSync(this.settingsPath, 'utf-8')
        return { ...defaultSettings, ...JSON.parse(content) }
      }
    } catch {
      /* ignore parse errors, use defaults */
    }
    return { ...defaultSettings }
  }
  private saveSettings(): void {
    try {
      fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2), 'utf-8')
    } catch (error) {
      console.error('Error saving notification settings:', error)
    }
  }
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    this.saveSettings()
  }
  getSettings(): NotificationSettings {
    return { ...this.settings }
  }
  start(): void {
    if (this.checkInterval) return
    this.checkInterval = setInterval(() => {
      this.checkAndSendReminders()
    }, 30 * 60 * 1000)
    this.checkAndSendReminders()
  }
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }
  private async checkAndSendReminders(): Promise<void> {
    if (!this.settings.enabled) return
    try {
      if (this.settings.meetingReminders) {
        await this.checkMeetingReminders()
      }
      if (this.settings.actionReminders) {
        await this.checkActionReminders()
      }
    } catch (error) {
      console.error('Error checking reminders:', error)
    }
  }
  private async checkMeetingReminders(): Promise<void> {
    this.pruneStaleMeetingReminderIds()
    const now = new Date()
    const reminderMs = this.settings.reminderHoursBefore * 60 * 60 * 1000
    const reminderThreshold = new Date(now.getTime() + reminderMs)
    const daysAhead = Math.max(1, Math.ceil(this.settings.reminderHoursBefore / 24))
    const upcomingMeetings = this.db.getUpcomingMeetings(daysAhead)
    let changed = false
    for (const meeting of upcomingMeetings) {
      const meetingDate = new Date(meeting.date)
      if (meetingDate <= now || meetingDate > reminderThreshold) continue
      const idKey = String(meeting.id)
      if (this.sentMeetingReminderIds.has(idKey)) continue
      const msUntil = meetingDate.getTime() - now.getTime()
      const hoursUntil = Math.max(1, Math.ceil(msUntil / (1000 * 60 * 60)))
      this.sendMeetingReminder(meeting.title || '', meeting.personName || '', hoursUntil)
      this.sentMeetingReminderIds.add(idKey)
      changed = true
    }
    if (changed) this.persistSentState()
  }
  private async checkActionReminders(): Promise<void> {
    const todayKey = localDateKey(new Date())
    if (this.lastActionSummaryDate === todayKey) return
    const pendingActions = this.db.getPendingActionItems()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    let overdueCount = 0
    let dueTodayCount = 0
    let dueTomorrowCount = 0
    for (const action of pendingActions) {
      if (!action.dueDate) continue
      const dueDate = new Date(action.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      if (dueDate < today) {
        overdueCount++
      } else if (dueDate.getTime() === today.getTime()) {
        dueTodayCount++
      } else if (dueDate.getTime() === tomorrow.getTime()) {
        dueTomorrowCount++
      }
    }
    if (overdueCount > 0 || dueTodayCount > 0) {
      this.sendActionSummaryReminder(overdueCount, dueTodayCount, dueTomorrowCount)
      this.lastActionSummaryDate = todayKey
      this.persistSentState()
    }
  }
  private getIcon(): string {
    return app.isPackaged
      ? `${process.resourcesPath}/build/icon.png`
      : 'build/icon.png'
  }
  sendMeetingReminder(title: string, personName: string, hoursUntil: number): void {
    if (!Notification.isSupported()) return
    const s = getLocaleStrings()
    const timeText = hoursUntil === 1 ? s.hour1 : s.hours.replace('{n}', String(hoursUntil))
    const body = s.meetingBody
      .replace('{person}', personName)
      .replace('{title}', title)
      .replace('{time}', timeText)
    const notification = new Notification({
      title: s.meetingReminder,
      body,
      icon: this.getIcon(),
    })
    notification.show()
  }
  sendActionSummaryReminder(overdue: number, dueToday: number, dueTomorrow: number): void {
    if (!Notification.isSupported()) return
    const s = getLocaleStrings()
    const parts: string[] = []
    if (overdue > 0) {
      parts.push(s.overdueActions.replace('{n}', String(overdue)))
    }
    if (dueToday > 0) {
      parts.push(s.dueTodayActions.replace('{n}', String(dueToday)))
    }
    if (dueTomorrow > 0) {
      parts.push(s.dueTomorrowActions.replace('{n}', String(dueTomorrow)))
    }
    if (parts.length === 0) return
    const notification = new Notification({
      title: s.actionReminder,
      body: parts.join(' '),
      icon: this.getIcon(),
    })
    notification.show()
  }
  sendTestNotification(): void {
    if (!Notification.isSupported()) {
      console.log('Notifications not supported on this platform')
      return
    }
    const s = getLocaleStrings()
    const notification = new Notification({
      title: s.testTitle,
      body: s.testBody,
      icon: this.getIcon(),
    })
    notification.show()
  }
}
