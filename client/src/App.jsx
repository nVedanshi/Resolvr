import { Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import TicketDetailPage from './pages/TicketDetailPage.jsx';
import { NotFoundPanel } from './components/States.jsx';

// Maps the three screens onto the shared application shell.
export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />
        <Route path="*" element={<NotFoundPanel message="That page does not exist." />} />
      </Route>
    </Routes>
  );
}