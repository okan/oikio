import * as Dialog from '@radix-ui/react-dialog'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'
import { useTranslation } from 'react-i18next'
interface FormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  onSubmit?: (e: React.FormEvent) => void
  isSubmitting?: boolean
  submitLabel?: string
  cancelLabel?: string
  showFooter?: boolean
  footerContent?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}
const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}
export function FormModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  cancelLabel,
  showFooter = true,
  footerContent,
  size = 'md',
}: FormModalProps) {
  const { t } = useTranslation()
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(e)
  }
  const handleOpenChange = (newOpen: boolean) => {
    if (isSubmitting && !newOpen) return
    onOpenChange(newOpen)
  }
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50',
            'w-full bg-white rounded-xl shadow-xl',
            'focus:outline-none',
            '-translate-x-1/2 -translate-y-1/2',
            'data-[state=open]:animate-modal-in data-[state=closed]:animate-modal-out',
            'max-h-[90vh] flex flex-col',
            sizeClasses[size],
            className
          )}
        >
          { }
          <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-slate-500 mt-1">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                aria-label={t('common.close')}
                disabled={isSubmitting}
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>
          { }
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto flex-1">{children}</div>
            { }
            {showFooter && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 flex-shrink-0 bg-slate-50 rounded-b-xl">
                {footerContent || (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => onOpenChange(false)}
                      disabled={isSubmitting}
                    >
                      {cancelLabel || t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          {t('common.saving')}
                        </>
                      ) : (
                        submitLabel || t('common.save')
                      )}
                    </Button>
                  </>
                )}
              </div>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  onConfirm: () => void | Promise<void>
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  isLoading?: boolean
}
export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel,
  cancelLabel,
  variant = 'default',
  isLoading = false,
}: ConfirmModalProps) {
  const { t } = useTranslation()
  const handleConfirm = async () => {
    await onConfirm()
    onOpenChange(false)
  }
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50',
            'w-full max-w-md bg-white rounded-xl shadow-xl p-6',
            'focus:outline-none',
            '-translate-x-1/2 -translate-y-1/2',
            'data-[state=open]:animate-modal-in data-[state=closed]:animate-modal-out'
          )}
        >
          <Dialog.Title className="text-lg font-semibold text-slate-900">
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description className="text-sm text-slate-500 mt-2">
              {description}
            </Dialog.Description>
          )}
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {cancelLabel || t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                confirmLabel || t('common.confirm')
              )}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
