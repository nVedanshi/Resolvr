import { ArrowRightIcon } from './Icons.jsx';

const RANGE = 5;

// Builds a compact window of page numbers centred on the current page.
function pageWindow(current, total) {
  const half = Math.floor(RANGE / 2);
  let start = Math.max(1, current - half);
  const end = Math.min(total, start + RANGE - 1);
  start = Math.max(1, end - RANGE + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

// Renders the page controls for the current result set.
function PageControls({ page, totalPages, onPageChange }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className="btn-secondary px-2.5 py-1.5 text-xs"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>

      {pageWindow(page, totalPages).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onPageChange(value)}
          aria-current={value === page ? 'page' : undefined}
          className={`min-w-8 rounded px-2 py-1.5 text-xs font-medium tabular-nums transition-colors ${
            value === page ? 'bg-accent text-accent-ink' : 'text-ink-2 hover:bg-surface-3 hover:text-ink'
          }`}
        >
          {value}
        </button>
      ))}

      <button
        type="button"
        className="btn-secondary px-2.5 py-1.5 text-xs"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}

/**
 * Combines pagination with a triage action: it pages forward while results
 * remain, then offers the next unresolved case, or returns to the top of the
 * queue once nothing on the final page still needs work.
 */
export default function ListFooter({ pagination, tickets, onPageChange, onOpenTicket }) {
  const { page, pageSize, total, totalPages } = pagination;
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  const hasMorePages = page < totalPages;
  const nextTicket = tickets.find((ticket) => ticket.status !== 'RESOLVED');

  // Resolved tickets sort last in triage order, so the final page needs a way back.
  let triageAction = null;

  if (hasMorePages) {
    triageAction = (
      <button type="button" onClick={() => onPageChange(page + 1)} className="btn-secondary">
        Continue triage
        <ArrowRightIcon />
      </button>
    );
  } else if (nextTicket) {
    triageAction = (
      <button type="button" onClick={() => onOpenTicket(nextTicket.id)} className="btn-secondary">
        Next ticket needing attention
        <ArrowRightIcon />
      </button>
    );
  } else if (page > 1) {
    triageAction = (
      <button type="button" onClick={() => onPageChange(1)} className="btn-ghost">
        Back to the top of the queue
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs tabular-nums text-ink-3">
        Showing <span className="font-medium text-ink-2">{first}</span>–
        <span className="font-medium text-ink-2">{last}</span> of{' '}
        <span className="font-medium text-ink-2">{total}</span> tickets
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {triageAction}

        <PageControls page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}