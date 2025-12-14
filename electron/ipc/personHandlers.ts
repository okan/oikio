import { ipcMain } from 'electron'
import type { DatabaseService } from '../services/database'
export function registerPersonHandlers(db: DatabaseService): void {
  ipcMain.handle('db:persons:getAll', () => {
    return db.getAllPersons()
  })
  ipcMain.handle('db:persons:getById', (_, id: number) => {
    return db.getPersonById(id)
  })
  ipcMain.handle('db:persons:create', (_, data) => {
    return db.createPerson(data)
  })
  ipcMain.handle('db:persons:update', (_, id: number, data) => {
    return db.updatePerson(id, data)
  })
  ipcMain.handle('db:persons:delete', (_, id: number) => {
    return db.deletePerson(id)
  })
  ipcMain.handle('db:persons:needingAttention', () => {
    return db.getPersonsNeedingAttention()
  })
}
