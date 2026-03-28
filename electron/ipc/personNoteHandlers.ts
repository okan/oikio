import { ipcMain } from 'electron'
import type { DatabaseService } from '../services/database/index'

export function registerPersonNoteHandlers(db: DatabaseService): void {
  ipcMain.handle('db:personNotes:getByPerson', (_, personId: number) => {
    return db.getPersonNotesByPerson(personId)
  })
  ipcMain.handle('db:personNotes:create', (_, data: { personId: number; content: string }) => {
    return db.createPersonNote(data)
  })
  ipcMain.handle('db:personNotes:delete', (_, id: number) => {
    return db.deletePersonNote(id)
  })
}
