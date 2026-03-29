import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}
export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  const { t } = useTranslation()
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-stone-900/40 z-50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50',
            'w-full max-w-lg bg-white rounded-xl shadow-2xl',
            'focus:outline-none',
            '-translate-x-1/2 -translate-y-1/2',
            'border border-stone-200',
            'data-[state=open]:animate-modal-in data-[state=closed]:animate-modal-out',
            className
          )}
        >
          <div className="flex items-start justify-between p-5 border-b border-stone-100">
            <div>
              <Dialog.Title className="text-base font-semibold text-stone-900">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-stone-500 mt-0.5">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                aria-label={t('common.close')}
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="p-6">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
