import { useEffect, useState } from 'react';
import { PRIORITY_LABEL, STATUS_LABEL } from '../lib/format.js';
import { Keycap, SearchIcon } from './Icons.jsx';

const SORT_OPTIONS = [
  ['triage', 'Triage order'],
  ['newest', 'Newest first'],
  ['oldest', 'Oldest first'],
];

/**
 * Search, filters and sorting for the ticket list. Every value is written to the
 * URL, so the view is bookmarkable and the server stays the source of results.
 */
export default function TicketToolbar({ filters, onChange, onClear, onNewTicket }) {
  const [term, setTerm] = useState(filters.search);

  // Keep the input in sync when the URL changes from elsewhere.
  useEffect(() => {
    setTerm(filters.search);
  }, [filters.search]);

  // Debounce so typing does not fire a request per keystroke.
  useEffect(() => {
    if (term === filters.search) return undefined;

    const timer = setTimeout(() => onChange({ search: term }), 350);
    return () => clearTimeout(timer);
  }, [term, filters.search, onChange]);

  const hasFilters = Boolean(filters.search || filters.status || filters.priority);

  return (
    <div className="card p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <label htmlFor="ticket-search" className="sr-only">
            Search tickets
          </label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
          <input
            id="ticket-search"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search tickets..."
            autoComplete="off"
            className="field-control pr-9 pl-9"
          />
          {term.length === 0 ? (
            <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2">
              <Keycap>/</Keycap>
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:items-center">
          <div className="relative">
            <label htmlFor="status-filter" className="sr-only">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(event) => onChange({ status: event.target.value })}
              className="field-control pr-8"
            >
              <option value="">All statuses</option>
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {filters.status === '' ? (
              <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
                <Keycap>F</Keycap>
              </span>
            ) : null}
          </div>

          <div>
            <label htmlFor="priority-filter" className="sr-only">
              Filter by priority
            </label>
            <select
              id="priority-filter"
              value={filters.priority}
              onChange={(event) => onChange({ priority: event.target.value })}
              className="field-control"
            >
              <option value="">All priorities</option>
              {Object.entries(PRIORITY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sort-select" className="sr-only">
              Sort tickets
            </label>
            <select
              id="sort-select"
              value={filters.sort}
              onChange={(event) => onChange({ sort: event.target.value })}
              className="field-control"
            >
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <button type="button" onClick={onClear} disabled={!hasFilters} className="btn-ghost">
            Clear filters
          </button>
          <button type="button" onClick={onNewTicket} className="btn-primary">
            <span aria-hidden="true">+</span> New ticket
          </button>
        </div>
      </div>
    </div>
  );
}