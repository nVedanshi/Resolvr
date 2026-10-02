import { useEffect, useRef, useState } from 'react';
import { SHORTCUT_GROUPS } from '../hooks/useKeyboardShortcuts.js';
import { useTheme } from '../context/ThemeContext.jsx';
import { Keycap as KeycapGlyph, MenuIcon, MoonIcon, SunIcon } from './Icons.jsx';

/**
 * Compact anchored dropdown holding navigation, theming and the shortcut
 * reference. It closes on the toggle button, Escape, an outside click and any
 * item activation, all driven from the single `open` prop above it.
 */
export function CommandMenu({ open, onToggle, onClose, onNavigate }) {
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    if (!open) return undefined;

    // Dismisses the menu when a click lands anywhere outside the trigger and panel.
    function onPointerDown(event) {
      if (!containerRef.current?.contains(event.target)) onClose();
    }

    document.addEventListener('mousedown', onPointerDown);

    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setShowAbout(false);
  }, [open]);

  // Escape closes the menu. The global shortcut hook ignores Escape, so this
  // listener and native <dialog> handling are the only Escape consumers.
  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Every navigation entry closes the menu as it goes.
  function go(path) {
    onClose();
    onNavigate(path);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={onToggle}
        className="btn-icon"
        aria-label="Menu"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MenuIcon />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Main menu"
          className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-lg border border-line bg-surface shadow-lg"
        >
          <nav className="border-b border-line p-1.5" aria-label="Go to">
            <MenuItem label="Dashboard" hint="D" onSelect={() => go('/')} />
            <MenuItem label="Analytics" hint="A" onSelect={() => go('/analytics')} />
            <MenuItem label="Triage" hint="T" onSelect={() => go('/?sort=triage')} />
          </nav>

          <div className="border-b border-line p-1.5">
            <ThemeMenuItem onSelect={onClose} />

            <button
              type="button"
              role="menuitem"
              onClick={() => setShowAbout((current) => !current)}
              aria-expanded={showAbout}
              className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              About RESOLVR
              <span className="text-[11px] text-ink-3">{showAbout ? 'Hide' : 'Show'}</span>
            </button>

            {showAbout ? (
              <p className="mx-1 mb-1 rounded-md bg-surface-2 px-2.5 py-2 text-xs leading-relaxed text-ink-3">
                Internal support desk on Express and PostgreSQL. Every figure is counted by the
                database. Authentication is out of scope.
              </p>
            ) : null}
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            <p className="section-label mb-1">Keyboard shortcuts</p>
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.title} className="mb-2 last:mb-0">
                <p className="px-1 pt-1 pb-0.5 text-[10px] font-semibold tracking-wider text-ink-3 uppercase">
                  {group.title}
                </p>
                {group.items.map((item) => (
                  <div
                    key={item.description}
                    className="flex items-center justify-between gap-3 px-1 py-0.5"
                  >
                    <span className="text-xs text-ink-2">{item.description}</span>
                    <Keycap keys={item.keys} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Renders one menu row with its optional shortcut hint.
function MenuItem({ label, hint, onSelect }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {label}
      {hint ? <Keycap keys={[hint]} /> : null}
    </button>
  );
}

// Offers the theme flip inside the menu, labelled for the theme being left.
function ThemeMenuItem({ onSelect }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        toggleTheme();
        onSelect();
      }}
      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {isDark ? (
        <SunIcon size={14} className="text-ink-3" />
      ) : (
        <MoonIcon size={14} className="text-ink-3" />
      )}
      {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    </button>
  );
}

// Draws a row of keycaps for a shortcut such as `Esc` or a single letter.
function Keycap({ keys }) {
  return (
    <span className="flex shrink-0 gap-0.5">
      {keys.map((key) => (
        <KeycapGlyph key={key}>{key}</KeycapGlyph>
      ))}
    </span>
  );
}

// Switches between the light and dark palettes.
export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-icon"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}