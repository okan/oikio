import {
  WelcomeHero,
  TodayFocus,
  RelationshipGrid,
  MiniAnalytics,
} from '@/components/dashboard'
export function Dashboard() {
  return (
    <div className="space-y-6">
      { }
      <WelcomeHero />
      { }
      <MiniAnalytics />
      { }
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayFocus />
        <RelationshipGrid />
      </div>
    </div>
  )
}
export default Dashboard
