import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const WorkspaceContext = createContext(null);

/**
 * Holds the dataset-wide data more than one screen needs: the summary counts,
 * the analytics aggregates and a revision counter the ticket list uses to
 * refetch after a mutation. Fetching here keeps the header, the summary tiles
 * and the triage queue in agreement without duplicate requests.
 */
export function WorkspaceProvider({ children }) {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryResult, analyticsResult] = await Promise.all([
        api.getSummary(),
        api.getAnalytics(),
      ]);

      setSummary(summaryResult);
      setAnalytics(analyticsResult);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Called after any mutation, and by the refresh shortcut, so that the shared
  // figures and the visible list are recomputed from the database together.
  const notifyTicketChanged = useCallback(() => {
    setRevision((current) => current + 1);
    load();
  }, [load]);

  const value = {
    summary,
    analytics,
    error,
    loading,
    revision,
    notifyTicketChanged,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

// Exposes the shared summary and analytics data to the screens that display it.
export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error('useWorkspace must be used inside <WorkspaceProvider>');
  }

  return context;
}