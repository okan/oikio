import { ipcMain } from 'electron'
import type { DatabaseService } from '../services/database'
export function registerTemplateHandlers(db: DatabaseService): void {
  ipcMain.handle('db:templates:getAll', () => {
    return db.getAllTemplates()
  })
  ipcMain.handle('db:templates:getById', (_, id: number) => {
    return db.getTemplateById(id)
  })
  ipcMain.handle('db:templates:create', (_, data) => {
    return db.createTemplate(data)
  })
  ipcMain.handle('db:templates:update', (_, id: number, data) => {
    return db.updateTemplate(id, data)
  })
  ipcMain.handle('db:templates:delete', (_, id: number) => {
    return db.deleteTemplate(id)
  })
}
