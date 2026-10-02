const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Compact ticket age used in the list: `<1m`, `42m`, `7h`, `2d`, `3w`.
 */
export function relativeAge(value, now = Date.now()) {
  const elapsed = Math.max(0, now - new Date(value).getTime());

  if (elapsed < MINUTE) return '<1m';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h`;
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)}d`;
  return `${Math.floor(elapsed / (7 * DAY))}w`;
}

// Formats a timestamp as a readable calendar date.
export function formatDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Formats a timestamp including the time of day.
export function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Formats a calendar day key as a short label for the activity chart.
export function formatDayLabel(dayKey) {
  const [year, month, day] = dayKey.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

// Renders a count as a whole percentage, or an em dash for an empty dataset.
export function formatShare(count, total) {
  if (!total) return '—';
  return `${Math.round((count / total) * 100)}%`;
}

// Joins a count with its noun, pluralising when needed.
export function pluralise(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export const PRIORITY_LABEL = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };
export const STATUS_LABEL = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
};
export const SORT_LABEL = {
  triage: 'Triage order',
  newest: 'Newest first',
  oldest: 'Oldest first',
};