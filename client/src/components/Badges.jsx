import { PRIORITY_LABEL, STATUS_LABEL } from '../lib/format.js';

const STATUS_TONE = {
  OPEN: 'bg-low-soft text-low ring-low-line',
  IN_PROGRESS: 'bg-active-soft text-active ring-active-line',
  RESOLVED: 'bg-done-soft text-done ring-done-line',
};

const PRIORITY_TONE = {
  HIGH: 'bg-high-soft text-high ring-high-line',
  MEDIUM: 'bg-med-soft text-med ring-med-line',
  LOW: 'bg-low-soft text-low ring-low-line',
};

const PRIORITY_DOT = {
  HIGH: 'bg-high',
  MEDIUM: 'bg-med',
  LOW: 'bg-low',
};

const BADGE_BASE =
  'inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset';

// Renders the status pill, optionally playing the short resolved acknowledgement.
export function StatusBadge({ status, animate = false }) {
  return (
    <span
      className={`${BADGE_BASE} ${STATUS_TONE[status] ?? STATUS_TONE.OPEN} ${animate ? 'resolve-ack' : ''}`}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

// Renders the priority pill used in the list and on the case file.
export function PriorityBadge({ priority }) {
  return (
    <span className={`${BADGE_BASE} ${PRIORITY_TONE[priority] ?? PRIORITY_TONE.LOW}`}>
      {PRIORITY_LABEL[priority] ?? priority}
    </span>
  );
}

// Small colour dot that marks a priority level without a full pill.
export function PriorityDot({ priority }) {
  return (
    <span
      aria-hidden="true"
      className={`size-1.5 shrink-0 rounded-full ${PRIORITY_DOT[priority] ?? PRIORITY_DOT.LOW}`}
    />
  );
}

// Thin colour bar that marks the priority of a ticket row at a glance.
export function PriorityBar({ priority }) {
  return (
    <span
      aria-hidden="true"
      className={`my-1 block w-0.5 shrink-0 self-stretch rounded-full ${PRIORITY_DOT[priority] ?? PRIORITY_DOT.LOW}`}
    />
  );
}