import { Link } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { pluralise } from '../lib/format.js';
import { ArrowLeftIcon, ArrowRightIcon } from '../components/Icons.jsx';
import StatusBreakdown from '../components/analytics/StatusBreakdown.jsx';
import PriorityBreakdown from '../components/analytics/PriorityBreakdown.jsx';
import ActivityChart from '../components/analytics/ActivityChart.jsx';
import { ChartSkeleton } from '../components/Skeletons.jsx';
import { ErrorState } from '../components/States.jsx';

/**
 * Dataset-wide reporting built from the analytics endpoint. Kept separate from
 * the dashboard so the operational queue is never buried under charts.
 */
export default function AnalyticsPage() {
  const { analytics, loading, error, notifyTicketChanged } = useWorkspace();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink"
        >
          <ArrowLeftIcon />
          Back to dashboard
        </Link>

        <Link to="/?sort=triage" className="btn-ghost">
          Start triage
          <ArrowRightIcon />
        </Link>
      </div>

      <header>
        <h1 className="text-lg font-semibold tracking-tight text-ink">Analytics</h1>
        <p className="mt-0.5 text-xs text-ink-3">
          Every figure is counted by PostgreSQL across the whole dataset, ignoring filters.
        </p>
      </header>

      {loading && !analytics ? <ChartSkeleton /> : null}

      {error && !analytics ? (
        <ErrorState
          title="Could not load analytics"
          message={error.message}
          onRetry={notifyTicketChanged}
        />
      ) : null}

      {analytics ? (
        <>
          <Totals totals={analytics.totals} />

          <div className="grid gap-3 lg:grid-cols-2">
            <Panel title="Status distribution" hint={pluralise(analytics.totals.total, 'ticket')}>
              <StatusBreakdown rows={analytics.status} total={analytics.totals.total} />
            </Panel>

            <Panel title="Priority distribution">
              <PriorityBreakdown rows={analytics.priority} total={analytics.totals.total} />
            </Panel>
          </div>

          <Panel title="Ticket activity" hint={`Last ${analytics.activity.length} days`}>
            <ActivityChart days={analytics.activity} />
          </Panel>
        </>
      ) : null}
    </div>
  );
}

// Condenses the headline totals above the charts.
function Totals({ totals }) {
  const rows = [
    { label: 'Total tickets', value: totals.total },
    { label: 'Unresolved', value: totals.unresolved },
    { label: 'Resolved', value: totals.resolved },
  ];

  return (
    <dl className="grid grid-cols-3 gap-3">
      {rows.map((row) => (
        <div key={row.label} className="card px-3.5 py-3">
          <dt className="section-label">{row.label}</dt>
          <dd className="mt-1.5 text-xl leading-none font-semibold tabular-nums text-ink">
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// Wraps a chart with the shared panel heading used across the analytics view.
function Panel({ title, hint, children }) {
  return (
    <section className="card px-5 py-4">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {hint ? <span className="text-xs text-ink-3">{hint}</span> : null}
      </div>
      {children}
    </section>
  );
}