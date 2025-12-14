import { useTranslation } from 'react-i18next'
import * as Dialog from '@radix-ui/react-dialog'
import { Keyboard, X } from 'lucide-react'
interface KeyboardShortcutsHelpProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
export function KeyboardShortcutsHelp({ open, onOpenChange }: KeyboardShortcutsHelpProps) {
  const { t } = useTranslation()
  const shortcuts = [
    { keys: ['⌘', 'K'], description: t('shortcuts.search') },
    { keys: ['⌘', '⇧', 'A'], description: t('shortcuts.quickAction') },
    { keys: ['⌘', 'N'], description: t('shortcuts.newMeeting') },
    { keys: ['⌘', '⇧', 'N'], description: t('shortcuts.newPerson') },
    { keys: ['⌘', '/'], description: t('shortcuts.help') },
    { keys: ['Esc'], description: t('shortcuts.closeModal') },
  ]
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden focus:outline-none data-[state=open]:animate-modal-in data-[state=closed]:animate-modal-out">
          { }
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary-600" />
              <Dialog.Title className="font-semibold text-slate-900">
                {t('shortcuts.title')}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>
          { }
          <div className="p-4 space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">{shortcut.description}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <kbd
                      key={keyIndex}
                      className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded border border-slate-200"
                    >
                      {key}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
          { }
          <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500 text-center">
              {t('shortcuts.tip')}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
