import { useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets.js';
import { useCommands } from '../context/CommandContext.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { pluralise } from '../lib/format.js';
import SummaryMetrics from '../components/SummaryMetrics.jsx';
import AttentionOverview from '../components/AttentionOverview.jsx';
import TicketToolbar from '../components/TicketToolbar.jsx';
import TicketList from '../components/TicketList.jsx';
import ListFooter from '../components/ListFooter.jsx';
import { TicketListSkeleton } from '../components/Skeletons.jsx';
import { EmptyState, ErrorState } from '../components/States.jsx';

const DEFAULTS = { search: '', status: '', priority: '', sort: 'newest', page: 1 };

/**
 * The operational queue, ordered overview → attention → filters → results →
 * pagination, so an agent reads top to bottom without any other navigation.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { openNewTicket } = useCommands();
  const [searchParams, setSearchParams] = useSearchParams();
  const { revision } = useWorkspace();

  // The URL is the single source of truth for the current view.
  const filters = readFilters(searchParams);
  const updateFilters = useFilterUpdater(setSearchParams);
  const clearFilters = useCallback(
    () => updateFilters({ search: '', status: '', priority: '', sort: DEFAULTS.sort }),
    [updateFilters],
  );

  const { data, error, loading, reload } = useTickets({ ...filters, revision });
  const tickets = data?.tickets ?? [];
  const pagination = data?.pagination;
  const hasActiveView = Boolean(filters.search || filters.status || filters.priority);

  return (
    <div className="space-y-5">
      <SummaryMetrics />
      <AttentionOverview />

      <section aria-labelledby="tickets-heading" className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="tickets-heading" className="text-sm font-semibold text-ink">
            Tickets
          </h2>

          {pagination ? (
            <p className="text-xs text-ink-3">
              {hasActiveView
                ? `${pluralise(pagination.total, 'ticket')} match`
                : pluralise(pagination.total, 'ticket')}
            </p>
          ) : null}
        </div>

        <TicketToolbar
          filters={filters}
          onChange={updateFilters}
          onClear={clearFilters}
          onNewTicket={openNewTicket}
        />

        {error ? <ErrorState message={error.message} onRetry={reload} /> : null}

        {!error && loading ? <TicketListSkeleton /> : null}

        {!error && !loading && tickets.length === 0 ? (
          hasActiveView ? (
            <EmptyState
              title="No tickets match these filters"
              description="Try a different search term, or clear the filters to see the whole queue."
              action={
                <button type="button" onClick={clearFilters} className="btn-secondary">
                  Clear filters
                </button>
              }
            />
          ) : (
            <EmptyState
              title="No tickets yet"
              description="Create the first ticket to start working the queue."
              action={
                <button type="button" onClick={openNewTicket} className="btn-primary">
                  + New ticket
                </button>
              }
            />
          )
        ) : null}

        {!error && !loading && tickets.length > 0 ? (
          <>
            <TicketList tickets={tickets} />
            <ListFooter
              pagination={pagination}
              tickets={tickets}
              onPageChange={(page) => updateFilters({ page })}
              onOpenTicket={(id) => navigate(`/tickets/${id}`)}
            />
          </>
        ) : null}
      </section>
    </div>
  );
}

// Reads the active view out of the query string.
function readFilters(searchParams) {
  return {
    search: searchParams.get('search') ?? DEFAULTS.search,
    status: searchParams.get('status') ?? DEFAULTS.status,
    priority: searchParams.get('priority') ?? DEFAULTS.priority,
    sort: searchParams.get('sort') ?? DEFAULTS.sort,
    page: Number.parseInt(searchParams.get('page') ?? '1', 10) || DEFAULTS.page,
  };
}

// Writes filter changes back to the URL, resetting to page one on any change.
function useFilterUpdater(setSearchParams) {
  return useCallback(
    (patch) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);

          for (const [key, value] of Object.entries(patch)) {
            if (value === '' || value === null || value === undefined) {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          }

          // Any change to the result set invalidates the current page number.
          if (!('page' in patch)) next.delete('page');

          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );
}