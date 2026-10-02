import { useEffect, useRef } from 'react';

/**
 * Single-key shortcuts. Lookup is case-insensitive so `n` and `N` behave the
 * same, which matters because Shift changes `event.key` on letter keys.
 */
const SHORTCUT_KEYS = {
  '/': 'onSearch',
  n: 'onNewTicket',
  d: 'onDashboard',
  a: 'onAnalytics',
  t: 'onTriage',
  f: 'onFilters',
  r: 'onRefresh',
  '?': 'onShortcuts',
};

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

// True when focus is inside a field the user could be typing into.
function isTypingTarget(target) {
  if (!target) return false;
  if (EDITABLE_TAGS.has(target.tagName)) return true;
  if (target.isContentEditable) return true;

  return target.getAttribute?.('role') === 'textbox';
}

/**
 * Registers the global single-key shortcuts, ignoring keystrokes aimed at form
 * fields and any modifier combination so browser shortcuts keep working.
 */
export function useKeyboardShortcuts(handlers) {
  // Reads the newest handlers without re-registering the listener on every render.
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      const handlerName = SHORTCUT_KEYS[event.key.toLowerCase()];
      if (!handlerName) return;

      const handler = handlersRef.current[handlerName];
      if (!handler) return;

      event.preventDefault();
      handler();
    }

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}

// Moves focus to the toolbar search box on the dashboard.
export function focusSearchField() {
  document.getElementById('ticket-search')?.focus();
}

// Moves focus to the first filter control on the dashboard.
export function focusFilters() {
  document.getElementById('status-filter')?.focus();
}

// The complete shortcut reference shown in the menu and the shortcuts panel.
export const SHORTCUT_GROUPS = [
  {
    title: 'Navigation',
    items: [
      { keys: ['D'], description: 'Dashboard' },
      { keys: ['A'], description: 'Analytics' },
      { keys: ['T'], description: 'Triage' },
    ],
  },
  {
    title: 'Actions',
    items: [
      { keys: ['N'], description: 'New ticket' },
      { keys: ['/'], description: 'Search' },
      { keys: ['F'], description: 'Filters' },
      { keys: ['R'], description: 'Refresh' },
    ],
  },
  {
    title: 'General',
    items: [
      { keys: ['Esc'], description: 'Close / Back' },
      { keys: ['?'], description: 'Shortcuts' },
    ],
  },
];