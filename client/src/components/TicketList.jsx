import { Link } from 'react-router-dom';
import { formatDate, relativeAge } from '../lib/format.js';
import { PriorityBadge, PriorityBar, StatusBadge } from './Badges.jsx';

const COLUMNS = ['Title', 'Customer', 'Priority', 'Status', 'Age', 'Created'];

/**
 * Renders the current page of tickets. Desktop shows the six aligned columns a
 * support agent scans; below `md` each ticket becomes a stacked card that keeps
 * every value, so nothing is lost to horizontal scrolling.
 */
export default function TicketList({ tickets }) {
  return (
    <div className="card overflow-hidden">
      <div className="hidden border-b border-line bg-surface-2 px-4 md:block">
        <div className="ticket-grid py-2 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">
          {COLUMNS.map((column, index) => (
            <span
              key={column}
              className={index < 2 ? 'truncate' : 'text-right'}
            >
              {column}
            </span>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-line">
        {tickets.map((ticket) => (
          <li key={ticket.id}>
            <Link
              to={`/tickets/${ticket.id}`}
              className="group block px-4 py-3 transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
            >
              <div className="flex items-start gap-3 md:hidden">
                <PriorityBar priority={ticket.priority} />

                <span className="min-w-0 flex-1 space-y-1.5">
                  <span className="block truncate text-sm font-medium text-ink group-hover:underline">
                    {ticket.title}
                  </span>
                  <span className="block truncate text-xs text-ink-3">
                    {ticket.customerEmail}
                  </span>
                  <span className="flex flex-wrap items-center gap-1.5">
                    <PriorityBadge priority={ticket.priority} />
                    <StatusBadge status={ticket.status} />
                  </span>
                  <span className="flex flex-wrap gap-x-3 text-xs text-ink-3">
                    <span>
                      Age <span className="tabular-nums">{relativeAge(ticket.createdAt)}</span>
                    </span>
                    <span>
                      Created <span className="tabular-nums">{formatDate(ticket.createdAt)}</span>
                    </span>
                  </span>
                </span>
              </div>

              <div className="hidden md:block">
                <div className="ticket-grid items-center">
                  <span className="flex min-w-0 items-center gap-3">
                    <PriorityBar priority={ticket.priority} />
                    <span className="truncate text-sm font-medium text-ink group-hover:underline">
                      {ticket.title}
                    </span>
                  </span>

                  <span className="truncate text-sm text-ink-2">{ticket.customerEmail}</span>

                  <span className="flex justify-end">
                    <PriorityBadge priority={ticket.priority} />
                  </span>

                  <span className="flex justify-end">
                    <StatusBadge status={ticket.status} />
                  </span>

                  <span className="text-right text-sm tabular-nums text-ink-2">
                    {relativeAge(ticket.createdAt)}
                  </span>

                  <span className="text-right text-sm tabular-nums text-ink-2">
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}