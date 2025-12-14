import { Notification, app } from 'electron'
import { DatabaseService } from './database'
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
export class NotificationService {
  private db: DatabaseService
  private settings: NotificationSettings
  private checkInterval: NodeJS.Timeout | null = null
  constructor(db: DatabaseService) {
    this.db = db
    this.settings = this.loadSettings()
  }
  private loadSettings(): NotificationSettings {
    return defaultSettings
  }
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
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
          this.sendMeetingReminder(meeting.title, meeting.personName || '', hoursUntil)
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
  sendMeetingReminder(title: string, personName: string, hoursUntil: number): void {
    if (!Notification.isSupported()) return
    const timeText = hoursUntil === 1 ? '1 saat' : `${hoursUntil} saat`
    const notification = new Notification({
      title: 'Toplantı Hatırlatıcı',
      body: `${personName} ile "${title}" toplantınız ${timeText} sonra.`,
      icon: app.isPackaged 
        ? `${process.resourcesPath}/build/icon.png`
        : 'build/icon.png',
    })
    notification.show()
  }
  sendActionSummaryReminder(overdue: number, today: number, tomorrow: number): void {
    if (!Notification.isSupported()) return
    let body = ''
    if (overdue > 0) {
      body += `${overdue} gecikmiş aksiyon. `
    }
    if (today > 0) {
      body += `${today} aksiyon bugün bitmeli. `
    }
    if (tomorrow > 0) {
      body += `${tomorrow} aksiyon yarın bitmeli.`
    }
    if (!body) return
    const notification = new Notification({
      title: 'Aksiyon Hatırlatıcı',
      body: body.trim(),
      icon: app.isPackaged 
        ? `${process.resourcesPath}/build/icon.png`
        : 'build/icon.png',
    })
    notification.show()
  }
  sendTestNotification(): void {
    if (!Notification.isSupported()) {
      console.log('Notifications not supported on this platform')
      return
    }
    const notification = new Notification({
      title: 'Oikio Test',
      body: 'Bildirimler düzgün çalışıyor!',
      icon: app.isPackaged 
        ? `${process.resourcesPath}/build/icon.png`
        : 'build/icon.png',
    })
    notification.show()
  }
}
