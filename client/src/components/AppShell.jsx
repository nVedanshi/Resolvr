import { Outlet, useNavigate } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import { ThemeProvider } from '../context/ThemeContext.jsx';
import { CommandProvider } from '../context/CommandContext.jsx';
import { WorkspaceProvider, useWorkspace } from '../context/WorkspaceContext.jsx';
import {
  focusFilters,
  focusSearchField,
  useKeyboardShortcuts,
} from '../hooks/useKeyboardShortcuts.js';
import { TopNav } from './TopNav.jsx';
import NewTicketDialog from './NewTicketDialog.jsx';

// Wraps every route with the theme, shared data, shortcuts and the ticket dialog.
export default function AppShell() {
  return (
    <ThemeProvider>
      <WorkspaceProvider>
        <Shell />
      </WorkspaceProvider>
    </ThemeProvider>
  );
}

// Hosts the navigation chrome, the shortcuts and the new ticket dialog.
function Shell() {
  const navigate = useNavigate();
  const { notifyTicketChanged } = useWorkspace();
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openNewTicket = useCallback(() => setNewTicketOpen(true), []);
  const closeNewTicket = useCallback(() => setNewTicketOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

  const commands = useMemo(() => ({ openNewTicket }), [openNewTicket]);

  useKeyboardShortcuts({
    onSearch: focusSearchField,
    onFilters: focusFilters,
    onNewTicket: openNewTicket,
    onShortcuts: openMenu,
    onDashboard: () => navigate('/'),
    onAnalytics: () => navigate('/analytics'),
    onTriage: () => navigate('/?sort=triage'),
    onRefresh: notifyTicketChanged,
  });

  return (
    <CommandProvider value={commands}>
      <div className="flex min-h-dvh flex-col">
        <TopNav
          menuOpen={menuOpen}
          onToggleMenu={toggleMenu}
          onCloseMenu={closeMenu}
          onNavigate={navigate}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>

        <NewTicketDialog
          open={newTicketOpen}
          onClose={closeNewTicket}
          onCreated={notifyTicketChanged}
        />
      </div>
    </CommandProvider>
  );
}