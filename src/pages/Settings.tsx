import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Upload, Database, Info, Globe, Bell, AlertTriangle } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Modal, Select, Checkbox } from '@/components/ui'
import type { NotificationSettings } from '@/types'
export function Settings() {
  const { t, i18n } = useTranslation()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const settings = await window.api.notifications.getSettings()
        setNotificationSettings(settings)
      } catch (error) {
        console.error('Error loading notification settings:', error)
      }
    }
    loadNotificationSettings()
  }, [])
  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('oikio-language', lang)
  }
  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = await window.api.data.export()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `oikio-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setSuccessMessage(t('settings.exportSuccess'))
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }
  const handleImportClick = () => {
    setImportModalOpen(true)
  }
  const handleImportConfirm = () => {
    fileInputRef.current?.click()
    setImportModalOpen(false)
  }
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    try {
      const text = await file.text()
      await window.api.data.import(text)
      setSuccessMessage(t('settings.importSuccess'))
      setTimeout(() => {
        setSuccessMessage('')
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Import error:', error)
      alert('Import failed. Check the file format.')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }
  useEffect(() => {
    if (localStorage.getItem('resetSuccess') === 'true') {
      setSuccessMessage(t('settings.resetSuccess'))
      localStorage.removeItem('resetSuccess')
      setTimeout(() => setSuccessMessage(''), 5000)
    }
  }, [t])
  const handleResetConfirm = async () => {
    try {
      await window.api.data.reset()
      localStorage.setItem('resetSuccess', 'true')
      setResetModalOpen(false)
      window.location.reload()
    } catch (error) {
      console.error('Reset error:', error)
    }
  }
  const languageOptions = [
    { value: 'en', label: t('settings.english') },
    { value: 'tr', label: t('settings.turkish') },
  ]
  const handleNotificationChange = async (key: keyof NotificationSettings, value: boolean | number) => {
    if (!notificationSettings) return
    const newSettings = { ...notificationSettings, [key]: value }
    setNotificationSettings(newSettings)
    try {
      await window.api.notifications.updateSettings({ [key]: value })
    } catch (error) {
      console.error('Error updating notification settings:', error)
    }
  }
  const handleTestNotification = async () => {
    try {
      await window.api.notifications.test()
      setSuccessMessage(t('settings.notificationSent'))
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error sending test notification:', error)
    }
  }
  return (
    <div className="space-y-6">
      <Header title={t('settings.title')} description={t('settings.description')} />
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      { }
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary-100 rounded-xl text-primary-600">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-slate-900">{t('settings.language')}</h2>
            <p className="text-sm text-slate-500 mb-4">{t('settings.languageDesc')}</p>
            <div className="max-w-xs">
              <Select
                value={i18n.language}
                onValueChange={handleLanguageChange}
                options={languageOptions}
              />
            </div>
          </div>
        </div>
      </div>
      { }
      {notificationSettings && (
        <div className="card p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-100 rounded-xl text-primary-600">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-900">{t('settings.notifications')}</h2>
              <p className="text-sm text-slate-500 mb-4">{t('settings.notificationsDesc')}</p>
              <div className="space-y-4">
                <Checkbox
                  id="notificationsEnabled"
                  label={t('settings.enableNotifications')}
                  checked={notificationSettings.enabled}
                  onCheckedChange={(checked) => handleNotificationChange('enabled', checked)}
                />
                {notificationSettings.enabled && (
                  <div className="ml-7 space-y-3">
                    <Checkbox
                      id="meetingReminders"
                      label={t('settings.meetingReminders')}
                      checked={notificationSettings.meetingReminders}
                      onCheckedChange={(checked) => handleNotificationChange('meetingReminders', checked)}
                    />
                    <Checkbox
                      id="actionReminders"
                      label={t('settings.actionReminders')}
                      checked={notificationSettings.actionReminders}
                      onCheckedChange={(checked) => handleNotificationChange('actionReminders', checked)}
                    />
                  </div>
                )}
                <div className="pt-4">
                  <Button variant="secondary" size="sm" onClick={handleTestNotification}>
                    {t('settings.testNotification')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      { }
      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100 rounded-xl text-primary-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{t('settings.dataManagement')}</h2>
            <p className="text-sm text-slate-500">{t('settings.dataDesc')}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Download className="w-5 h-5 text-primary-600" />
              <h3 className="font-medium text-slate-900">{t('settings.export')}</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">{t('settings.exportDesc')}</p>
            <Button
              onClick={handleExport}
              isLoading={isExporting}
              variant="secondary"
              className="w-full"
            >
              {t('settings.exportButton')}
            </Button>
          </div>
          <div className="p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <Upload className="w-5 h-5 text-primary-600" />
              <h3 className="font-medium text-slate-900">{t('settings.import')}</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">{t('settings.importDesc')}</p>
            <Button
              onClick={handleImportClick}
              isLoading={isImporting}
              variant="secondary"
              className="w-full"
            >
              {t('settings.importButton')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
      { }
      <div className="card p-6 border-red-100 bg-red-50/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-xl text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-red-900">{t('settings.dangerZone')}</h2>
            <p className="text-sm text-red-600/80">{t('settings.dangerZoneDesc')}</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 bg-white border border-red-100 rounded-xl">
          <div>
            <h3 className="font-medium text-slate-900">{t('settings.resetData')}</h3>
            <p className="text-sm text-slate-500">{t('settings.resetDataDesc')}</p>
          </div>
          <Button
            variant="danger"
            onClick={() => setResetModalOpen(true)}
          >
            {t('settings.resetButton')}
          </Button>
        </div>
      </div>
      { }
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary-100 rounded-xl text-primary-600">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">{t('settings.about')}</h2>
            <p className="text-sm text-slate-500">oikio</p>
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-600">
          <p>
            <span className="font-medium">{t('settings.version')}:</span> {__APP_VERSION__}
          </p>
          <p>
            <span className="font-medium">{t('settings.dataLocation')}:</span> ~/Library/Application Support/oikio/
          </p>
          <p className="text-slate-500 mt-4">{t('settings.privacyNote')}</p>
        </div>
      </div>
      { }
      <Modal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        title={t('settings.import')}
        description={t('settings.importWarning')}
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setImportModalOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleImportConfirm}>
            {t('settings.continue')}
          </Button>
        </div>
      </Modal>
      { }
      <Modal
        open={resetModalOpen}
        onOpenChange={setResetModalOpen}
        title={t('settings.resetConfirmTitle')}
        description={t('settings.resetConfirmDesc')}
      >
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm">
          {t('settings.resetWarning')}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setResetModalOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleResetConfirm}>
            {t('settings.confirmReset')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
export default Settings
