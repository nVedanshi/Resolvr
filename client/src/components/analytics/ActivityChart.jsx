import { formatDayLabel } from '../../lib/format.js';

const WIDTH = 720;
const HEIGHT = 200;
const PAD_LEFT = 28;
const PAD_BOTTOM = 24;
const PLOT_HEIGHT = HEIGHT - PAD_BOTTOM;

// Rounds the axis maximum up to a readable whole number.
function niceMax(value) {
  if (value <= 2) return 2;
  return Math.ceil(value / 2) * 2;
}

/**
 * Daily volume for the last two weeks: tickets created beside tickets that are
 * now resolved. Drawn as plain SVG so the chart inherits the theme tokens.
 */
export default function ActivityChart({ days }) {
  const max = niceMax(Math.max(...days.flatMap((day) => [day.created, day.resolved]), 1));
  const plotWidth = WIDTH - PAD_LEFT;
  const slot = plotWidth / days.length;
  const barWidth = Math.max(3, slot / 3);

  // Converts a count into a bar height relative to the axis maximum.
const heightFor = (value) => (value / max) * PLOT_HEIGHT;
  const labelIndices = [0, Math.floor(days.length / 2), days.length - 1];

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Tickets created and resolved per day over the last ${days.length} days.`}
      >
        {[0, max / 2, max].map((value) => {
          const y = PLOT_HEIGHT - heightFor(value);

          return (
            <g key={value}>
              <line
                x1={PAD_LEFT}
                x2={WIDTH}
                y1={y}
                y2={y}
                stroke="var(--color-line)"
                strokeWidth="1"
                strokeDasharray={value === 0 ? undefined : '3 3'}
              />
              <text
                x={PAD_LEFT - 8}
                y={y + 3}
                textAnchor="end"
                className="fill-[var(--color-ink-3)] text-[9px]"
              >
                {value}
              </text>
            </g>
          );
        })}

        {days.map((day, index) => {
          const x = PAD_LEFT + index * slot;
          const createdHeight = heightFor(day.created);
          const resolvedHeight = heightFor(day.resolved);

          return (
            <g key={day.date}>
              <rect
                x={x + slot / 2 - barWidth - 1}
                y={PLOT_HEIGHT - createdHeight}
                width={barWidth}
                height={createdHeight}
                rx="1.5"
                fill="var(--color-ink-3)"
                opacity="0.55"
              >
                <title>{`${day.date}: ${day.created} created`}</title>
              </rect>

              <rect
                x={x + slot / 2 + 1}
                y={PLOT_HEIGHT - resolvedHeight}
                width={barWidth}
                height={resolvedHeight}
                rx="1.5"
                fill="var(--color-done)"
                opacity="0.8"
              >
                <title>{`${day.date}: ${day.resolved} resolved`}</title>
              </rect>

              {labelIndices.includes(index) ? (
                <text
                  x={x + slot / 2}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className="fill-[var(--color-ink-3)] text-[9px]"
                >
                  {formatDayLabel(day.date)}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
        <span className="flex items-center gap-1.5 text-xs text-ink-2">
          <span aria-hidden="true" className="size-2 rounded-full bg-ink-3 opacity-55" />
          Created
        </span>
        <span className="flex items-center gap-1.5 text-xs text-ink-2">
          <span aria-hidden="true" className="size-2 rounded-full bg-done opacity-80" />
          Resolved
        </span>
        <span className="text-xs text-ink-3">
          Resolved tickets are dated by their last update; the model has no separate resolution
          timestamp.
        </span>
      </div>
    </div>
  );
}