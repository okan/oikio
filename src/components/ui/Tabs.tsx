import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
interface Tab {
    id: string
    label: string
    icon?: LucideIcon
    count?: number
}
interface TabsProps {
    tabs: Tab[]
    activeTab: string
    onChange: (tabId: string) => void
    className?: string
}
export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
    return (
        <div className={cn('border-b border-slate-200', className)}>
            <nav className="-mb-px flex gap-4" aria-label="Tabs">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    const Icon = tab.icon
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onChange(tab.id)}
                            className={cn(
                                'group inline-flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            )}
                        >
                            {Icon && (
                                <Icon
                                    className={cn(
                                        'w-4 h-4',
                                        isActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-500'
                                    )}
                                />
                            )}
                            <span>{tab.label}</span>
                            {tab.count !== undefined && (
                                <span
                                    className={cn(
                                        'ml-1 rounded-full py-0.5 px-2 text-xs font-medium',
                                        isActive
                                            ? 'bg-primary-100 text-primary-600'
                                            : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                                    )}
                                >
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </nav>
        </div>
    )
}
