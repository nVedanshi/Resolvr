import { CommandMenu, ThemeToggle } from './CommandMenu.jsx';

// Top navigation carrying only the wordmark, theme toggle and menu button.
export function TopNav({ menuOpen, onToggleMenu, onCloseMenu, onNavigate }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <span className="text-[15px] font-bold tracking-[0.02em] text-ink">RESOLVR</span>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />

          <CommandMenu
            open={menuOpen}
            onToggle={onToggleMenu}
            onClose={onCloseMenu}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </header>
  );
}