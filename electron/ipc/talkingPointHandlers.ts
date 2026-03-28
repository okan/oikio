import { ipcMain } from 'electron'
import type { DatabaseService } from '../services/database/index'

export function registerTalkingPointHandlers(db: DatabaseService): void {
  ipcMain.handle('db:talkingPoints:getByPerson', (_, personId: number) => {
    return db.getTalkingPointsByPerson(personId)
  })
  ipcMain.handle('db:talkingPoints:create', (_, data: { personId: number; content: string }) => {
    return db.createTalkingPoint(data)
  })
  ipcMain.handle('db:talkingPoints:toggleComplete', (_, id: number) => {
    return db.toggleTalkingPointComplete(id)
  })
  ipcMain.handle('db:talkingPoints:delete', (_, id: number) => {
    return db.deleteTalkingPoint(id)
  })
}
