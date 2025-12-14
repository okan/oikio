import { app, BrowserWindow } from 'electron'
import path from 'path'
import { DatabaseService } from './services/database'
import { NotificationService } from './services/notifications'
import { registerAllHandlers } from './ipc'
app.disableHardwareAcceleration()
let mainWindow: BrowserWindow | null = null
let db: DatabaseService | null = null
let notificationService: NotificationService | null = null
function createWindow(): void {
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
function initializeServices(): void {
  db = new DatabaseService()
  notificationService = new NotificationService(db)
  notificationService.start()
  registerAllHandlers(db, notificationService)
}
app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    const iconPath = path.join(app.getAppPath(), 'build/icon.png')
    app.dock.setIcon(iconPath)
  }
  initializeServices()
  createWindow()
})
app.on('window-all-closed', () => {
  if (notificationService) {
    notificationService.stop()
  }
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
