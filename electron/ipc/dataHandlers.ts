import { ipcMain } from 'electron'
import type { DatabaseService } from '../services/database'
export function registerDataHandlers(db: DatabaseService): void {
  ipcMain.handle('db:stats:getDashboard', () => {
    return db.getDashboardStats()
  })
  ipcMain.handle('db:export', () => {
    return db.exportData()
  })
  ipcMain.handle('db:import', (_, data: string) => {
    return db.importData(data)
  })
  ipcMain.handle('db:reset', () => {
    return db.reset()
  })
  ipcMain.handle('db:search', (_, query: string) => {
    return db.search(query)
  })
}
