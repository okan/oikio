import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useActionStore } from '@/store'
import { Header } from '@/components/layout'
import { ActionList } from '@/components/action'
import { cn, isOverdue } from '@/lib/utils'
import { Search, Layers, AlertCircle, Hourglass, User, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui'
export function Actions() {
  const { t } = useTranslation()
  const {
    actions,
    allTags,
    fetchActions,
    fetchPendingActions,
    fetchAllTags,
    toggleComplete,
    deleteAction,
  } = useActionStore()
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchActions()
    fetchPendingActions()
    fetchAllTags()
  }, [fetchActions, fetchPendingActions, fetchAllTags])

  const stats = {
    total: actions.filter(a => !a.completed).length,
    overdue: actions.filter(a => !a.completed && a.dueDate && isOverdue(a.dueDate)).length,
    waiting: actions.filter(a => !a.completed && a.assignedTo === 'other').length,
  }

  const tabCounts = {
    pending: actions.filter(a => !a.completed).length,
    completed: actions.filter(a => a.completed).length,
    all: actions.length,
  }

  const filteredActions = actions.filter((a) => {
    const matchesTag = !selectedTag || a.tags?.includes(selectedTag)
    const matchesSearch = !searchQuery || a.description.toLowerCase().includes(searchQuery.toLowerCase())
    const isTabMatch =
      activeTab === 'all' ||
      (activeTab === 'pending' && !a.completed) ||
      (activeTab === 'completed' && a.completed)
    return matchesTag && matchesSearch && isTabMatch
  })

  const myActions = filteredActions.filter(a => a.assignedTo !== 'other')
  const otherActions = filteredActions.filter(a => a.assignedTo === 'other')
  return (
    <div className="space-y-6">
      <Header title={t('actions.title')} description={t('actions.description')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">{t('actions.active')}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary-600" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">{t('dashboard.overdue')}</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{stats.overdue}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">{t('actions.other')}</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{stats.waiting}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
            <Hourglass className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="flex-1"
          />
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['pending', 'completed', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2',
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {t(`actions.${tab}`)}
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                    activeTab === tab
                      ? tab === 'pending' && tabCounts[tab] > 0
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-slate-100 text-slate-600'
                      : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full border transition-colors',
                !selectedTag
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              {t('tags.all')}
            </button>
            {allTags.map((tag: string) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded-full border transition-colors',
                  selectedTag === tag
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-8 pt-4">
          {myActions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <User className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{t('actions.me')}</h3>
                <span className="text-xs text-slate-400">({myActions.length})</span>
              </div>
              <ActionList
                actions={myActions}
                onToggle={(id) => toggleComplete(id)}
                onDelete={(id) => deleteAction(id)}
                showMeeting
                emptyTitle={t('actions.noPending')}
                emptyDescription={t('actions.noPendingDesc')}
              />
            </div>
          )}

          {otherActions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <ExternalLink className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">{t('actions.other')}</h3>
                <span className="text-xs text-slate-400">({otherActions.length})</span>
              </div>
              <ActionList
                actions={otherActions}
                onToggle={(id) => toggleComplete(id)}
                onDelete={(id) => deleteAction(id)}
                showMeeting
                emptyTitle={t('actions.noPending')}
                emptyDescription={t('actions.noPendingDesc')}
              />
            </div>
          )}

          {filteredActions.length === 0 && (
            <ActionList
              actions={[]}
              onToggle={() => { }}
              onDelete={() => { }}
              emptyTitle={t('actions.noActions')}
              emptyDescription={t('actions.noActionsDesc')}
            />
          )}
        </div>
      </div>
    </div>
  )
}
export default Actions
