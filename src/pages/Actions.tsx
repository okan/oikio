import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as Tabs from '@radix-ui/react-tabs'
import { useActionStore } from '@/store'
import { Header } from '@/components/layout'
import { ActionList } from '@/components/action'
import { cn } from '@/lib/utils'

export function Actions() {
  const { t } = useTranslation()
  const { actions, pendingActions, fetchActions, fetchPendingActions, toggleComplete, deleteAction } =
    useActionStore()
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchActions()
    fetchPendingActions()
  }, [fetchActions, fetchPendingActions])

  const completedActions = actions.filter((a) => a.completed)

  return (
    <div className="space-y-6">
      <Header title={t('actions.title')} description={t('actions.description')} />

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List className="flex gap-2 border-b border-slate-200 pb-2">
          <Tabs.Trigger
            value="pending"
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === 'pending'
                ? 'bg-primary-100 text-primary-700'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {t('actions.pending')} ({pendingActions.length})
          </Tabs.Trigger>
          <Tabs.Trigger
            value="completed"
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === 'completed'
                ? 'bg-primary-100 text-primary-700'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {t('actions.completed')} ({completedActions.length})
          </Tabs.Trigger>
          <Tabs.Trigger
            value="all"
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              activeTab === 'all'
                ? 'bg-primary-100 text-primary-700'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {t('actions.all')} ({actions.length})
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="pending" className="pt-6">
          <ActionList
            actions={pendingActions}
            onToggle={(id) => toggleComplete(id)}
            onDelete={(id) => deleteAction(id)}
            showMeeting
            emptyTitle={t('actions.noPending')}
            emptyDescription={t('actions.noPendingDesc')}
          />
        </Tabs.Content>

        <Tabs.Content value="completed" className="pt-6">
          <ActionList
            actions={completedActions}
            onToggle={(id) => toggleComplete(id)}
            onDelete={(id) => deleteAction(id)}
            showMeeting
            emptyTitle={t('actions.noCompleted')}
            emptyDescription={t('actions.noCompletedDesc')}
          />
        </Tabs.Content>

        <Tabs.Content value="all" className="pt-6">
          <ActionList
            actions={actions}
            onToggle={(id) => toggleComplete(id)}
            onDelete={(id) => deleteAction(id)}
            showMeeting
            emptyTitle={t('actions.noActions')}
            emptyDescription={t('actions.noActionsDesc')}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  )
}
