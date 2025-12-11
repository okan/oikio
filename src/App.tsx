import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout'
import {
  Dashboard,
  Persons,
  PersonDetail,
  Meetings,
  MeetingDetail,
  Actions,
  Templates,
  Settings,
} from '@/pages'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="persons" element={<Persons />} />
        <Route path="persons/:id" element={<PersonDetail />} />
        <Route path="meetings" element={<Meetings />} />
        <Route path="meetings/:id" element={<MeetingDetail />} />
        <Route path="actions" element={<Actions />} />
        <Route path="templates" element={<Templates />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App

