import { formatShare, PRIORITY_LABEL } from '../../lib/format.js';

const TONE = {
  HIGH: 'var(--color-high)',
  MEDIUM: 'var(--color-med)',
  LOW: 'var(--color-low)',
};

/** Compares how many tickets sit at each priority level. */
export default function PriorityBreakdown({ rows, total }) {
  const max = Math.max(...rows.map((row) => row.count), 1);

  return (
    <div>
      <div className="space-y-3.5">
        {rows.map((row) => (
          <div key={row.priority}>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-ink-2">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full"
                  style={{ backgroundColor: TONE[row.priority] }}
                />
                {PRIORITY_LABEL[row.priority]}
              </span>
              <span className="flex items-baseline gap-2 text-sm tabular-nums">
                <span className="font-medium text-ink">{row.count}</span>
                <span className="w-8 text-right text-xs text-ink-3">
                  {formatShare(row.count, total)}
                </span>
              </span>
            </div>

            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
              <span
                className="block h-full rounded-full"
                style={{ width: `${(row.count / max) * 100}%`, backgroundColor: TONE[row.priority] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}