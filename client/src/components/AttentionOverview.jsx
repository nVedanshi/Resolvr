import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { PRIORITY_LABEL, STATUS_LABEL } from '../lib/format.js';
import { PriorityDot } from './Badges.jsx';
import { TriageSkeleton } from './Skeletons.jsx';

const PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
const STATUSES = ['OPEN', 'IN_PROGRESS'];

// Reads one cell of the matrix, treating an absent combination as zero.
function cellCount(breakdown, priority, status) {
  return breakdown.find((row) => row.priority === priority && row.status === status)?.count ?? 0;
}

/**
 * Summarises the unresolved workload as a priority by status matrix. Every
 * number comes from the analytics endpoint, and columns with no unresolved
 * tickets are omitted so a support agent sees only real work.
 */
export default function AttentionOverview() {
  const { analytics, loading } = useWorkspace();

  if (loading && !analytics) return <TriageSkeleton />;

  if (!analytics) return null;

  const { total, breakdown } = analytics.unresolved;
  const columns = PRIORITIES.map((priority) => ({
    priority,
    total: STATUSES.reduce((sum, status) => sum + cellCount(breakdown, priority, status), 0),
  })).filter((column) => column.total > 0);

  if (columns.length === 0) {
    return (
      <section aria-labelledby="attention-heading" className="card px-5 py-4">
        <h2 id="attention-heading" className="section-label">
          Attention overview
        </h2>
        <p className="mt-2 text-sm text-ink-2">Every ticket has been resolved.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="attention-heading" className="card px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 id="attention-heading" className="section-label">
          Attention overview
        </h2>
        <p className="text-sm text-ink-2">
          <span className="font-semibold text-ink tabular-nums">{total}</span> unresolved tickets
        </p>
      </div>

      <div
        className="attention-grid mt-4 grid gap-4"
        style={{ '--columns': columns.length }}
      >
        {columns.map((column) => (
          <div key={column.priority}>
            <div className="flex items-center justify-between gap-2 border-b border-line pb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                <PriorityDot priority={column.priority} />
                {PRIORITY_LABEL[column.priority]}
              </span>
              <span className="text-xs tabular-nums text-ink-3">{column.total}</span>
            </div>

            <dl className="mt-2 space-y-1.5">
              {STATUSES.map((status) => {
                const count = cellCount(breakdown, column.priority, status);
                if (count === 0) return null;

                return (
                  <div key={status} className="flex items-baseline justify-between gap-3">
                    <dt className="text-sm text-ink-2">{STATUS_LABEL[status]}</dt>
                    <dd className="text-sm font-medium tabular-nums text-ink">{count}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}