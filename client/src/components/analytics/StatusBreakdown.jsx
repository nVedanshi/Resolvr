import { formatShare, STATUS_LABEL } from '../../lib/format.js';

const TONE = {
  OPEN: 'var(--color-low)',
  IN_PROGRESS: 'var(--color-active)',
  RESOLVED: 'var(--color-done)',
};

/** Shows how the whole dataset splits across the three ticket statuses. */
export default function StatusBreakdown({ rows, total }) {
  const segments = rows.filter((row) => row.count > 0);

  return (
    <div>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
        {segments.map((row) => (
          <span
            key={row.status}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(row.count / total) * 100}%`, backgroundColor: TONE[row.status] }}
          />
        ))}
      </div>

      <dl className="mt-4 space-y-2.5">
        {rows.map((row) => (
          <div key={row.status} className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-sm text-ink-2">
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: TONE[row.status] }}
              />
              {STATUS_LABEL[row.status]}
            </dt>
            <dd className="flex items-baseline gap-2 text-sm tabular-nums">
              <span className="font-medium text-ink">{row.count}</span>
              <span className="w-8 text-right text-xs text-ink-3">
                {formatShare(row.count, total)}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}