import { ipcMain } from 'electron'
import type { NotificationService, NotificationSettings } from '../services/notifications'
export function registerNotificationHandlers(notificationService: NotificationService): void {
  ipcMain.handle('notifications:getSettings', () => {
    return notificationService.getSettings()
  })
  ipcMain.handle('notifications:updateSettings', (_, settings: Partial<NotificationSettings>) => {
    notificationService.updateSettings(settings)
    return notificationService.getSettings()
  })
  ipcMain.handle('notifications:test', () => {
    return notificationService.sendTestNotification()
  })
}
