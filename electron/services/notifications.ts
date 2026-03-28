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
export class NotificationService {
  private db: DatabaseService
  private settings: NotificationSettings
  private checkInterval: NodeJS.Timeout | null = null
  constructor(db: DatabaseService) {
    this.db = db
    this.settings = this.loadSettings()
  }
  private get settingsPath(): string {
    return path.join(app.getPath('userData'), 'oikio-notification-settings.json')
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
    const now = new Date()
    const reminderThreshold = new Date(
      now.getTime() + this.settings.reminderHoursBefore * 60 * 60 * 1000
    )
    const upcomingMeetings = this.db.getUpcomingMeetings(2)
    for (const meeting of upcomingMeetings) {
      const meetingDate = new Date(meeting.date)
      if (meetingDate <= reminderThreshold && meetingDate > now) {
        const hoursUntil = Math.round(
          (meetingDate.getTime() - now.getTime()) / (1000 * 60 * 60)
        )
        if (hoursUntil === this.settings.reminderHoursBefore || hoursUntil === 1) {
          this.sendMeetingReminder(meeting.title || '', meeting.personName || '', hoursUntil)
        }
      }
    }
  }
  private async checkActionReminders(): Promise<void> {
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
