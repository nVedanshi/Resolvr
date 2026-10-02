import { Link } from 'react-router-dom';

// Explains that a query returned nothing and offers the obvious way out.
export function EmptyState({ title, description, action }) {
  return (
    <div className="card border-dashed px-6 py-14 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-md text-sm text-ink-3">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

// Reports a failed request with a retry affordance.
export function ErrorState({ title = 'Could not load tickets', message, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-high-line bg-high-soft px-6 py-10 text-center"
    >
      <p className="text-sm font-medium text-high">{title}</p>
      {message ? <p className="mx-auto mt-1 max-w-md text-sm text-high/80">{message}</p> : null}
      {onRetry ? (
        <button type="button" onClick={onRetry} className="btn-secondary mt-4">
          Try again
        </button>
      ) : null}
    </div>
  );
}

// Shown when a ticket or route cannot be found.
export function NotFoundPanel({ message, backTo = '/' }) {
  return (
    <div className="card border-dashed px-6 py-14 text-center">
      <p className="text-sm font-medium text-ink">{message}</p>
      <Link to={backTo} className="btn-secondary mt-4">
        Back to the queue
      </Link>
    </div>
  );
}