import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { formatDateTime, PRIORITY_LABEL, relativeAge, STATUS_LABEL } from '../lib/format.js';
import { PRIORITIES, STATUSES } from '../lib/ticketSchema.js';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { PriorityBadge, StatusBadge } from '../components/Badges.jsx';
import { ArrowLeftIcon, CheckIcon } from '../components/Icons.jsx';
import { ErrorState, NotFoundPanel } from '../components/States.jsx';

// Displays one ticket as a case file and saves status or priority changes.
export default function TicketDetailPage() {
  const { id } = useParams();
  const { notifyTicketChanged } = useWorkspace();

  const [ticket, setTicket] = useState(null);
  const [draft, setDraft] = useState({ status: '', priority: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [justResolved, setJustResolved] = useState(false);

  const savedTimerRef = useRef(null);
  const resolveTimerRef = useRef(null);

  // Loads the ticket and primes the edit form with its current values.
  const load = useCallback(() => {
    let active = true;

    setLoading(true);
    setError(null);

    api
      .getTicket(id)
      .then((result) => {
        if (!active) return;
        setTicket(result.ticket);
        setDraft({ status: result.ticket.status, priority: result.ticket.priority });
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
  }, [id]);

  useEffect(() => {
    const cleanup = load();

    return () => {
      cleanup?.();
      clearTimeout(savedTimerRef.current);
      clearTimeout(resolveTimerRef.current);
    };
  }, [load]);

  const dirty = Boolean(ticket) && (draft.status !== ticket.status || draft.priority !== ticket.priority);

  // Saves the edited fields and refreshes every derived figure in the app.
  async function handleSave(event) {
    event.preventDefault();
    if (!dirty) return;

    setSaving(true);
    setSaveError(null);

    const changes = {
      status: draft.status !== ticket.status ? draft.status : undefined,
      priority: draft.priority !== ticket.priority ? draft.priority : undefined,
    };

    try {
      const result = await api.updateTicket(ticket.id, changes);
      setTicket(result.ticket);

      // A single, brief acknowledgement when a ticket is closed out.
      if (result.ticket.status === 'RESOLVED') {
        setJustResolved(true);
        clearTimeout(resolveTimerRef.current);
        resolveTimerRef.current = setTimeout(() => setJustResolved(false), 1000);
      }

      setSaved(true);
      clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaved(false), 3000);

      notifyTicketChanged();
    } catch (requestError) {
      setSaveError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <DetailSkeleton />;

  if (error) {
    return error.status === 404 ? (
      <NotFoundPanel message="That ticket no longer exists." />
    ) : (
      <ErrorState title="Could not load this ticket" message={error.message} onRetry={load} />
    );
  }

  return (
    <div className="space-y-5">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-2 hover:text-ink">
        <ArrowLeftIcon />
        Back to the queue
      </Link>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <article className="card px-5 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-ink-3">#{ticket.id}</span>
            <StatusBadge status={ticket.status} animate={justResolved} />
            <PriorityBadge priority={ticket.priority} />
          </div>

          <h1 className="mt-3 text-xl leading-snug font-semibold tracking-tight text-ink">
            {ticket.title}
          </h1>

          <p className="mt-1.5 text-sm text-ink-2">
            Raised by{' '}
            <a
              href={`mailto:${ticket.customerEmail}`}
              className="font-medium text-ink underline decoration-line-strong underline-offset-2 hover:decoration-ink-3"
            >
              {ticket.customerEmail}
            </a>
          </p>

          <h2 className="section-label mt-6 mb-2">Description</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line text-ink-2">
            {ticket.description}
          </p>
        </article>

        <aside className="space-y-4">
          <form
            onSubmit={handleSave}
            className="card space-y-4 p-4"
            aria-label="Ticket actions"
          >
            <h2 className="section-label">Actions</h2>

            <div>
              <label htmlFor="detail-status" className="field-label">
                Status
              </label>
              <select
                id="detail-status"
                name="status"
                value={draft.status}
                onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
                disabled={saving}
                className="field-control"
              >
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {STATUS_LABEL[value]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="detail-priority" className="field-label">
                Priority
              </label>
              <select
                id="detail-priority"
                name="priority"
                value={draft.priority}
                onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))}
                disabled={saving}
                className="field-control"
              >
                {PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {PRIORITY_LABEL[value]}
                  </option>
                ))}
              </select>
            </div>

            {saveError ? (
              <p role="alert" className="rounded-md bg-high-soft px-3 py-2 text-xs text-high">
                {saveError}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <button type="submit" className="btn-primary flex-1" disabled={!dirty || saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              {saved ? (
                <span role="status" className="flex items-center gap-1 text-xs font-medium text-done">
                  <CheckIcon />
                  Saved
                </span>
              ) : null}
            </div>

            {dirty && !saving ? (
              <p className="text-xs text-ink-3">Unsaved changes on this ticket.</p>
            ) : null}
          </form>

          <dl className="card divide-y divide-line px-4 text-sm">
            <Meta label="Ticket age" value={relativeAge(ticket.createdAt)} />
            <Meta label="Created" value={formatDateTime(ticket.createdAt)} />
            <Meta label="Last updated" value={formatDateTime(ticket.updatedAt)} />
          </dl>
        </aside>
      </div>
    </div>
  );
}

// Renders one labelled value row inside the metadata list.
function Meta({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className="text-right text-xs font-medium tabular-nums text-ink-2">{value}</dd>
    </div>
  );
}

// Placeholder shown while the ticket is being fetched.
function DetailSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true">
      <span className="block h-4 w-28 rounded bg-surface-3" />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="card space-y-3 px-5 py-5">
          <span className="block h-3 w-40 rounded bg-surface-3" />
          <span className="block h-6 w-3/4 rounded bg-surface-3" />
          <span className="block h-4 w-52 rounded bg-surface-3" />
          <span className="mt-6 block h-32 w-full rounded bg-surface-3" />
        </div>
        <div className="card h-72" />
      </div>
    </div>
  );
}