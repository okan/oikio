import { cn, getInitials } from '@/lib/utils'
interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }
  const colors = [
    'bg-stone-600',
    'bg-stone-500',
    'bg-stone-700',
    'bg-stone-800',
    'bg-zinc-600',
    'bg-neutral-600',
  ]
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center font-medium text-white shadow-sm',
        sizes[size],
        colors[colorIndex],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
