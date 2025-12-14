import { ipcMain } from 'electron'
import type { DatabaseService } from '../services/database'
export function registerMeetingHandlers(db: DatabaseService): void {
  ipcMain.handle('db:meetings:getAll', () => {
    return db.getAllMeetings()
  })
  ipcMain.handle('db:meetings:getByPerson', (_, personId: number) => {
    return db.getMeetingsByPerson(personId)
  })
  ipcMain.handle('db:meetings:getById', (_, id: number) => {
    return db.getMeetingById(id)
  })
  ipcMain.handle('db:meetings:create', (_, data) => {
    return db.createMeeting(data)
  })
  ipcMain.handle('db:meetings:update', (_, id: number, data) => {
    return db.updateMeeting(id, data)
  })
  ipcMain.handle('db:meetings:delete', (_, id: number) => {
    return db.deleteMeeting(id)
  })
  ipcMain.handle('db:meetings:getUpcoming', (_, days: number) => {
    return db.getUpcomingMeetings(days)
  })
  ipcMain.handle('db:meetings:getRecent', (_, limit: number) => {
    return db.getRecentMeetings(limit)
  })
}
