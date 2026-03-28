import { ipcMain } from 'electron'
import type { DatabaseService } from '../services/database/index'
export function registerMeetingSkipHandlers(db: DatabaseService): void {
  ipcMain.handle('db:meetingSkips:create', (_, personId: number, reason?: string) => {
    return db.createMeetingSkip(personId, reason)
  })
  ipcMain.handle('db:meetingSkips:getByPerson', (_, personId: number) => {
    return db.getMeetingSkipsByPerson(personId)
  })
  ipcMain.handle('db:meetingSkips:getActive', (_, personId: number) => {
    return db.getActiveMeetingSkip(personId)
  })
}
