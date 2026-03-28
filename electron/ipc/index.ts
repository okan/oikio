import type { DatabaseService } from '../services/database/index'
import type { NotificationService } from '../services/notifications'
import { registerPersonHandlers } from './personHandlers'
import { registerMeetingHandlers } from './meetingHandlers'
import { registerActionHandlers } from './actionHandlers'
import { registerTemplateHandlers } from './templateHandlers'
import { registerDataHandlers } from './dataHandlers'
import { registerMeetingSkipHandlers } from './meetingSkipHandlers'
import { registerPersonNoteHandlers } from './personNoteHandlers'
import { registerNotificationHandlers } from './notificationHandlers'
export function registerAllHandlers(
  db: DatabaseService,
  notificationService: NotificationService
): void {
  registerPersonHandlers(db)
  registerMeetingHandlers(db)
  registerActionHandlers(db)
  registerTemplateHandlers(db)
  registerMeetingSkipHandlers(db)
  registerPersonNoteHandlers(db)
  registerDataHandlers(db)
  registerNotificationHandlers(notificationService)
}
export {
  registerPersonHandlers,
  registerMeetingHandlers,
  registerActionHandlers,
  registerTemplateHandlers,
  registerMeetingSkipHandlers,
  registerPersonNoteHandlers,
  registerDataHandlers,
  registerNotificationHandlers,
}
