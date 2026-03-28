import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  WelcomeHero,
  TodayFocus,
  RelationshipGrid,
} from '@/components/dashboard'
import { PageTransition } from '@/components/ui'
import { usePersonStore, useMeetingStore, useActionStore } from '@/store'
export function Dashboard() {
  const location = useLocation()
  const { persons, fetchPersons } = usePersonStore()
  const { meetings, fetchMeetings, upcomingMeetings, fetchUpcomingMeetings } = useMeetingStore()
  const { actions, fetchActions, pendingActions, fetchPendingActions } = useActionStore()
  useEffect(() => {
    fetchPersons()
    fetchMeetings()
    fetchActions()
    fetchPendingActions()
    fetchUpcomingMeetings(365)
  }, [fetchPersons, fetchMeetings, fetchActions, fetchPendingActions, fetchUpcomingMeetings])
  return (
    <PageTransition key={location.key} className="grid grid-cols-3 gap-4 auto-rows-min">
      <div className="col-span-3">
        <WelcomeHero meetings={meetings} actions={actions} />
      </div>
      <div className="col-span-2">
        <TodayFocus
          persons={persons}
          pendingActions={pendingActions}
          upcomingMeetings={upcomingMeetings}
        />
      </div>
      <div className="col-span-1">
        <RelationshipGrid persons={persons} futureMeetings={upcomingMeetings} />
      </div>
    </PageTransition>
  )
}
export default Dashboard
