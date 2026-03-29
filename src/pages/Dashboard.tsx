import { useEffect } from 'react'
import {
  WelcomeHero,
  WeeklySchedule,
  TodayFocus,
  RelationshipGrid,
} from '@/components/dashboard'
import { PageTransition } from '@/components/ui'
import { usePersonStore, useMeetingStore, useActionStore } from '@/store'
export function Dashboard() {
  const { persons, isLoading: personsLoading, fetchPersons } = usePersonStore()
  const { meetings, isLoading: meetingsLoading, fetchMeetings, upcomingMeetings, fetchUpcomingMeetings } = useMeetingStore()
  const { actions, isLoading: actionsLoading, fetchActions, pendingActions, fetchPendingActions } = useActionStore()
  const isLoading = personsLoading || meetingsLoading || actionsLoading
  useEffect(() => {
    fetchPersons()
    fetchMeetings()
    fetchActions()
    fetchPendingActions()
    fetchUpcomingMeetings(365)
  }, [fetchPersons, fetchMeetings, fetchActions, fetchPendingActions, fetchUpcomingMeetings])
  return (
    <PageTransition className="grid grid-cols-3 gap-4 auto-rows-min">
      <div className="col-span-3">
        <WelcomeHero meetings={meetings} actions={actions} isLoading={isLoading} />
      </div>
      <div className="col-span-3">
        <WeeklySchedule meetings={meetings} isLoading={isLoading} />
      </div>
      <div className="col-span-2">
        <TodayFocus
          persons={persons}
          pendingActions={pendingActions}
          upcomingMeetings={upcomingMeetings}
          isLoading={isLoading}
        />
      </div>
      <div className="col-span-1">
        <RelationshipGrid persons={persons} futureMeetings={upcomingMeetings} />
      </div>
    </PageTransition>
  )
}
export default Dashboard
