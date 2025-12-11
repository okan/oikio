import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { DatabaseService } from './services/database'

// Disable GPU acceleration for better compatibility
app.disableHardwareAcceleration()

let mainWindow: BrowserWindow | null = null
let db: DatabaseService | null = null

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f8fafc',
  })

  // Initialize database
  db = new DatabaseService()

  // Load the app
  if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // Set dock icon for macOS
  if (process.platform === 'darwin' && app.dock) {
    const iconPath = path.join(app.getAppPath(), 'build/icon.png')
    app.dock.setIcon(iconPath)
  }
  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

// IPC Handlers for database operations

// Person handlers
ipcMain.handle('db:persons:getAll', () => db?.getAllPersons())
ipcMain.handle('db:persons:getById', (_, id: number) => db?.getPersonById(id))
ipcMain.handle('db:persons:create', (_, data) => db?.createPerson(data))
ipcMain.handle('db:persons:update', (_, id: number, data) => db?.updatePerson(id, data))
ipcMain.handle('db:persons:delete', (_, id: number) => db?.deletePerson(id))

// Meeting handlers
ipcMain.handle('db:meetings:getAll', () => db?.getAllMeetings())
ipcMain.handle('db:meetings:getByPerson', (_, personId: number) => db?.getMeetingsByPerson(personId))
ipcMain.handle('db:meetings:getById', (_, id: number) => db?.getMeetingById(id))
ipcMain.handle('db:meetings:create', (_, data) => db?.createMeeting(data))
ipcMain.handle('db:meetings:update', (_, id: number, data) => db?.updateMeeting(id, data))
ipcMain.handle('db:meetings:delete', (_, id: number) => db?.deleteMeeting(id))
ipcMain.handle('db:meetings:getUpcoming', (_, days: number) => db?.getUpcomingMeetings(days))
ipcMain.handle('db:meetings:getRecent', (_, limit: number) => db?.getRecentMeetings(limit))

// Action item handlers
ipcMain.handle('db:actions:getAll', () => db?.getAllActionItems())
ipcMain.handle('db:actions:getByMeeting', (_, meetingId: number) => db?.getActionItemsByMeeting(meetingId))
ipcMain.handle('db:actions:getPending', () => db?.getPendingActionItems())
ipcMain.handle('db:actions:create', (_, data) => db?.createActionItem(data))
ipcMain.handle('db:actions:update', (_, id: number, data) => db?.updateActionItem(id, data))
ipcMain.handle('db:actions:delete', (_, id: number) => db?.deleteActionItem(id))
ipcMain.handle('db:actions:toggleComplete', (_, id: number) => db?.toggleActionItemComplete(id))

// Template handlers
ipcMain.handle('db:templates:getAll', () => db?.getAllTemplates())
ipcMain.handle('db:templates:getById', (_, id: number) => db?.getTemplateById(id))
ipcMain.handle('db:templates:create', (_, data) => db?.createTemplate(data))
ipcMain.handle('db:templates:update', (_, id: number, data) => db?.updateTemplate(id, data))
ipcMain.handle('db:templates:delete', (_, id: number) => db?.deleteTemplate(id))

// Stats handlers
ipcMain.handle('db:stats:getDashboard', () => db?.getDashboardStats())

// Export/Import handlers
ipcMain.handle('db:export', () => db?.exportData())
ipcMain.handle('db:import', (_, data: string) => db?.importData(data))

// Search handler
ipcMain.handle('db:search', (_, query: string) => db?.search(query))
