import { Link } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { ArrowRightIcon } from './Icons.jsx';
import { SummarySkeleton } from './Skeletons.jsx';

const TILES = [
  { key: 'total', label: 'Total', dot: 'bg-ink-3', tone: 'text-ink' },
  { key: 'OPEN', label: 'Open', dot: 'bg-low', tone: 'text-ink' },
  { key: 'IN_PROGRESS', label: 'In progress', dot: 'bg-active', tone: 'text-ink' },
  { key: 'RESOLVED', label: 'Resolved', dot: 'bg-done', tone: 'text-done' },
];

// Reads a tile value from the summary payload without special casing the total.
function tileValue(summary, key) {
  return key === 'total' ? summary.total : summary.byStatus[key];
}

// Shows the four dataset-wide counts, unaffected by any active filter.
export default function SummaryMetrics() {
  const { summary, loading, error } = useWorkspace();

  return (
    <section aria-labelledby="overview-heading" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div>
          <h2 id="overview-heading" className="text-sm font-semibold text-ink">
            Queue overview
          </h2>
          <p className="mt-0.5 text-xs text-ink-3">Counts across every ticket, not the current view.</p>
        </div>

        <Link to="/analytics" className="btn-ghost">
          View analytics
          <ArrowRightIcon />
        </Link>
      </div>

      {loading && !summary ? <SummarySkeleton /> : null}

      {error && !summary ? (
        <p className="rounded-md border border-high-line bg-high-soft px-3 py-2 text-xs text-high">
          Overview unavailable: {error.message}
        </p>
      ) : null}

      {summary ? (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TILES.map((tile) => (
            <div key={tile.key} className="card px-3.5 py-3">
              <dt className="flex items-center gap-1.5">
                <span aria-hidden="true" className={`size-1.5 rounded-full ${tile.dot}`} />
                <span className="section-label">{tile.label}</span>
              </dt>
              <dd className={`mt-1.5 text-2xl leading-none font-semibold tabular-nums ${tile.tone}`}>
                {tileValue(summary, tile.key)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}