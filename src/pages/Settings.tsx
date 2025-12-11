import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Download, Upload, Database, Info, Globe } from 'lucide-react'
import { Header } from '@/components/layout'
import { Button, Modal, Select } from '@/components/ui'

export function Settings() {
  const { t, i18n } = useTranslation()
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const languageOptions = [
    { value: 'en', label: t('settings.english') },
    { value: 'tr', label: t('settings.turkish') },
  ]

  return (
    <div className="space-y-6">
      <Header title={t('settings.title')} description={t('settings.description')} />

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Language Settings */}
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

      {/* Data Management */}
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

      {/* About */}
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
            <span className="font-medium">{t('settings.version')}:</span> 1.0.0
          </p>
          <p>
            <span className="font-medium">{t('settings.dataLocation')}:</span> ~/Library/Application Support/oikio/
          </p>
          <p className="text-slate-500 mt-4">{t('settings.privacyNote')}</p>
        </div>
      </div>

      {/* Import Confirmation Modal */}
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
    </div>
  )
}
