export function SnowDivider({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-4 my-2" aria-hidden={!label}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--accent-frost)] to-transparent" />
      <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
        <g stroke="var(--accent-ice)" strokeWidth="1.4" strokeLinecap="round">
          <line x1="12" y1="2" x2="12" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </g>
      </svg>
      {label ? (
        <span className="text-xs tracking-[0.2em] uppercase text-ink-faint font-data">
          {label}
        </span>
      ) : null}
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--accent-frost)] to-transparent" />
    </div>
  );
}
