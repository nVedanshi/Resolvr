// Base props shared by every icon; className lets callers size and position them.
function iconProps({ className, size = 16 }) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    className,
  };
}

// Small stroke icons drawn inline to avoid pulling in an icon package.
export function SunIcon(props) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon(props) {
  return (
    <svg {...iconProps(props)}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function MenuIcon(props) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 7h16M4 12h16M4 17h10" />
    </svg>
  );
}

export function SearchIcon(props) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

export function ArrowRightIcon(props) {
  return (
    <svg {...iconProps({ size: 14, ...props })}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <svg {...iconProps({ size: 14, ...props })}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function CheckIcon(props) {
  return (
    <svg {...iconProps({ size: 14, ...props })}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function CloseIcon(props) {
  return (
    <svg {...iconProps(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

// Draws a small keycap, used for the shortcut reference and contextual hints.
export function Keycap({ children }) {
  return (
    <kbd className="inline-flex min-w-5 items-center justify-center rounded border border-line bg-surface-3 px-1 py-px font-sans text-[10px] leading-none font-medium text-ink-3">
      {children}
    </kbd>
  );
}