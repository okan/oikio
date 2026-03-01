import {
  WelcomeHero,
  TodayFocus,
  RelationshipGrid,
} from '@/components/dashboard'
import { PageTransition } from '@/components/ui'
export function Dashboard() {
  return (
    <PageTransition className="grid grid-cols-3 gap-4 auto-rows-min">
      <div className="col-span-3">
        <WelcomeHero />
      </div>
      <div className="col-span-2">
        <TodayFocus />
      </div>
      <div className="col-span-1">
        <RelationshipGrid />
      </div>
    </PageTransition>
  )
}
export default Dashboard
