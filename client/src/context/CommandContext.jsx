import { createContext, useContext } from 'react';

const CommandContext = createContext(null);

/**
 * Shares the "new ticket" trigger between the header shortcut, the command menu
 * and the dashboard toolbar. The dialog itself is owned once by the app shell.
 */
export function CommandProvider({ value, children }) {
  return <CommandContext.Provider value={value}>{children}</CommandContext.Provider>;
}

// Exposes the shell-level commands to any screen that needs them.
export function useCommands() {
  const context = useContext(CommandContext);

  if (!context) {
    throw new Error('useCommands must be used inside <CommandProvider>');
  }

  return context;
}