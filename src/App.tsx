import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { ErrorBoundary } from '@/components/ui'
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Persons = lazy(() => import('@/pages/Persons'))
const PersonDetail = lazy(() => import('@/pages/PersonDetail'))
const Meetings = lazy(() => import('@/pages/Meetings'))
const MeetingDetail = lazy(() => import('@/pages/MeetingDetail'))
const Actions = lazy(() => import('@/pages/Actions'))
const Settings = lazy(() => import('@/pages/Settings'))
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Yükleniyor...</p>
      </div>
    </div>
  )
}
function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="persons"
            element={
              <Suspense fallback={<PageLoader />}>
                <Persons />
              </Suspense>
            }
          />
          <Route
            path="persons/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <PersonDetail />
              </Suspense>
            }
          />
          <Route
            path="meetings"
            element={
              <Suspense fallback={<PageLoader />}>
                <Meetings />
              </Suspense>
            }
          />
          <Route
            path="meetings/:id"
            element={
              <Suspense fallback={<PageLoader />}>
                <MeetingDetail />
              </Suspense>
            }
          />
          <Route
            path="actions"
            element={
              <Suspense fallback={<PageLoader />}>
                <Actions />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageLoader />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}
export default App
