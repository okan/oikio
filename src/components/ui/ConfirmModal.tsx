import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  variant?: 'danger' | 'warning'
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  variant = 'danger',
  confirmLabel,
  cancelLabel,
  isLoading,
}: ConfirmModalProps) {
  const { t } = useTranslation()

  const iconColors = {
    danger: 'bg-red-50 text-red-500',
    warning: 'bg-amber-50 text-amber-500',
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-stone-900/40 z-50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50',
            'w-full max-w-sm bg-white rounded-xl shadow-2xl',
            'focus:outline-none',
            '-translate-x-1/2 -translate-y-1/2',
            'border border-stone-200',
            'data-[state=open]:animate-modal-in data-[state=closed]:animate-modal-out'
          )}
        >
          <div className="p-6 text-center">
            <div
              className={cn(
                'w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-4',
                iconColors[variant]
              )}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <Dialog.Title className="text-base font-semibold text-stone-900">
              {title}
            </Dialog.Title>
            <Dialog.Description className="text-sm text-stone-500 mt-2 leading-relaxed">
              {description}
            </Dialog.Description>
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {cancelLabel || t('common.cancel')}
            </Button>
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              className="flex-1"
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {confirmLabel || t('common.delete')}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
