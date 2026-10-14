export function MarketSignalPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-widest text-accent">
        <span aria-hidden>→</span>
        Coming Soon
      </p>
      <h2 className="font-heading text-2xl font-bold text-foreground">Market Signal</h2>
      <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        A dedicated view for market signals and trend analysis is on the way. For now, head back to the News tab.
      </p>
    </div>
  );
}
