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
    'bg-primary-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
  ]
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium text-white',
        sizes[size],
        colors[colorIndex],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
