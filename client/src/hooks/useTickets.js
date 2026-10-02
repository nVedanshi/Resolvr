import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

/**
 * Fetches one page of tickets whenever the query parameters (or the revision
 * counter, bumped after a mutation) change. The server owns search, filtering,
 * sorting and pagination entirely.
 */
export function useTickets({ search, status, priority, sort, page, revision = 0 }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError(null);

    api
      .listTickets({ search, status, priority, sort, page })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((requestError) => {
        if (active) setError(requestError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, status, priority, sort, page, revision, reloadToken]);

  // Re-requests the current page after a failure so the retry button can work.
  const reload = useCallback(() => setReloadToken((current) => current + 1), []);

  return { data, error, loading, reload };
}