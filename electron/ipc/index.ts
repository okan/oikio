import type { DatabaseService } from '../services/database'
import type { NotificationService } from '../services/notifications'
import { registerPersonHandlers } from './personHandlers'
import { registerMeetingHandlers } from './meetingHandlers'
import { registerActionHandlers } from './actionHandlers'
import { registerTemplateHandlers } from './templateHandlers'
import { registerDataHandlers } from './dataHandlers'
import { registerNotificationHandlers } from './notificationHandlers'
export function registerAllHandlers(
  db: DatabaseService,
  notificationService: NotificationService
): void {
  registerPersonHandlers(db)
  registerMeetingHandlers(db)
  registerActionHandlers(db)
  registerTemplateHandlers(db)
  registerDataHandlers(db)
  registerNotificationHandlers(notificationService)
}
export {
  registerPersonHandlers,
  registerMeetingHandlers,
  registerActionHandlers,
  registerTemplateHandlers,
  registerDataHandlers,
  registerNotificationHandlers,
}
