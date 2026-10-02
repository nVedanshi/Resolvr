// Placeholder rows shown while the ticket list is loading.
export function TicketListSkeleton({ rows = 6 }) {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="hidden border-b border-line bg-surface-2 px-4 md:block">
        <div className="ticket-grid py-2" />
      </div>

      <div className="divide-y divide-line">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="px-4 py-3.5">
            <div className="ticket-grid items-center">
              <span className="flex items-center gap-3">
                <span className="h-8 w-0.5 rounded-full bg-line" />
                <span className="block h-3 w-2/5 rounded bg-surface-3" />
              </span>
              <span className="block h-3 w-24 rounded bg-surface-3" />
              <span className="block h-4 w-14 justify-self-end rounded bg-surface-3" />
              <span className="block h-4 w-16 justify-self-end rounded bg-surface-3" />
              <span className="block h-3 w-8 justify-self-end rounded bg-surface-3" />
              <span className="block h-3 w-16 justify-self-end rounded bg-surface-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Placeholder tiles shown while the summary counts load.
export function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="card px-3.5 py-3">
          <span className="block h-2.5 w-20 rounded bg-surface-3" />
          <span className="mt-2.5 block h-6 w-10 rounded bg-surface-3" />
        </div>
      ))}
    </div>
  );
}

// Placeholder block shown while the triage figures load.
export function TriageSkeleton() {
  return (
    <div className="card px-5 py-4" aria-hidden="true">
      <span className="block h-2.5 w-24 rounded bg-surface-3" />
      <span className="mt-2.5 block h-5 w-56 rounded bg-surface-3" />
      <span className="mt-3 block h-3 w-80 max-w-full rounded bg-surface-3" />
    </div>
  );
}

// Placeholder panels shown while the analytics charts load.
export function ChartSkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-2" aria-hidden="true">
      <div className="card h-56 px-5 py-4">
        <span className="block h-2.5 w-28 rounded bg-surface-3" />
        <span className="mt-4 block h-6 w-full rounded bg-surface-3" />
      </div>
      <div className="card h-56 px-5 py-4">
        <span className="block h-2.5 w-28 rounded bg-surface-3" />
        <span className="mt-4 block h-6 w-full rounded bg-surface-3" />
      </div>
      <div className="card h-64 px-5 py-4 lg:col-span-2">
        <span className="block h-2.5 w-28 rounded bg-surface-3" />
        <span className="mt-4 block h-32 w-full rounded bg-surface-3" />
      </div>
    </div>
  );
}