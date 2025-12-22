import { ipcMain } from 'electron'
import type { DatabaseService } from '../services/database'
export function registerActionHandlers(db: DatabaseService): void {
  ipcMain.handle('db:actions:getAll', () => {
    return db.getAllActionItems()
  })
  ipcMain.handle('db:actions:getByMeeting', (_, meetingId: number) => {
    return db.getActionItemsByMeeting(meetingId)
  })
  ipcMain.handle('db:actions:getPending', () => {
    return db.getPendingActionItems()
  })
  ipcMain.handle('db:actions:create', (_, data) => {
    return db.createActionItem(data)
  })
  ipcMain.handle('db:actions:update', (_, id: number, data) => {
    return db.updateActionItem(id, data)
  })
  ipcMain.handle('db:actions:delete', (_, id: number) => {
    return db.deleteActionItem(id)
  })
  ipcMain.handle('db:actions:toggleComplete', (_, id: number) => {
    return db.toggleActionItemComplete(id)
  })
  ipcMain.handle('db:actions:getAllTags', () => {
    return db.getAllActionTags()
  })
}
