import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { getTagColor } from '@/lib/tagColors'

interface TagProps {
    name: string
    onRemove?: () => void
    className?: string
}

export function Tag({ name, onRemove, className }: TagProps) {
    const { t } = useTranslation()
    const colors = getTagColor(name)

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors',
                colors.bg,
                colors.text,
                colors.border,
                className
            )}
        >
            {name}
            {onRemove && (
                <button
                    type="button"
                    aria-label={t('common.delete')}
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove()
                    }}
                    className={cn(
                        'rounded-full p-0.5 hover:bg-black/10 transition-colors',
                        '-mr-0.5'
                    )}
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </span>
    )
}
