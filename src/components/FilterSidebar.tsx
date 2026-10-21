"use client";

import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-widest text-accent">
      <span aria-hidden>→</span>
      {children}
    </p>
  );
}

export function RadioRow({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-1 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          active ? "border-foreground" : "border-zinc-400 dark:border-zinc-600"
        }`}
      >
        {active && <span className="h-2 w-2 rounded-full bg-foreground" />}
      </span>
      <span className={active ? "font-medium text-foreground" : "text-zinc-500 dark:text-zinc-400"}>{label}</span>
    </button>
  );
}

export function CheckboxRow({ checked, label, onClick }: { checked: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-1 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
          checked ? "border-foreground bg-foreground text-background" : "border-zinc-400 dark:border-zinc-600"
        }`}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 6l2.5 2.5L10 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={checked ? "font-medium text-foreground" : "text-zinc-500 dark:text-zinc-400"}>{label}</span>
    </button>
  );
}

export type TimeOption = { id: string; label: string };

export function FilterSidebar({
  timeOptions,
  activeTime,
  onTimeChange,
  sectors,
  selectedSectors,
  onToggleSector,
  onClearSectors,
  firms,
  firmSearch,
  onFirmSearchChange,
  activeFirm,
  onFirmChange,
}: {
  timeOptions: TimeOption[];
  activeTime: string;
  onTimeChange: (id: string) => void;
  sectors: string[];
  selectedSectors: Set<string>;
  onToggleSector: (sector: string) => void;
  onClearSectors: () => void;
  firms: string[];
  firmSearch: string;
  onFirmSearchChange: (value: string) => void;
  activeFirm: string;
  onFirmChange: (value: string) => void;
}) {
  const visibleFirms = firms.filter((f) => f.toLowerCase().includes(firmSearch.toLowerCase()));

  return (
    <aside className="w-full shrink-0 border-b border-zinc-200 px-6 py-6 lg:w-72 lg:border-b-0 lg:border-r lg:px-8 dark:border-zinc-800">
      <div className="flex flex-col gap-6 lg:sticky lg:top-[88px]">
        <div>
          <Eyebrow>Time Period</Eyebrow>
          <div className="flex flex-col gap-0.5">
            {timeOptions.map((t) => (
              <RadioRow key={t.id} active={activeTime === t.id} label={t.label} onClick={() => onTimeChange(t.id)} />
            ))}
          </div>
        </div>

        {sectors.length > 0 && (
          <div>
            <Eyebrow>Industries</Eyebrow>
            <div className="flex max-h-44 flex-col gap-0.5 overflow-y-auto pr-1">
              <CheckboxRow checked={selectedSectors.size === 0} label="All" onClick={onClearSectors} />
              {sectors.map((s) => (
                <CheckboxRow key={s} checked={selectedSectors.has(s)} label={s} onClick={() => onToggleSector(s)} />
              ))}
            </div>
          </div>
        )}

        {firms.length > 0 && (
          <div>
            <Eyebrow>Firms</Eyebrow>
            <input
              type="text"
              value={firmSearch}
              onChange={(e) => onFirmSearchChange(e.target.value)}
              placeholder="Type firm name…"
              className="mb-2 w-full rounded-full border border-zinc-300 bg-background px-3.5 py-1.5 text-sm text-foreground placeholder:text-zinc-400 focus:border-accent focus:outline-none dark:border-zinc-700"
            />
            <select
              value={activeFirm}
              onChange={(e) => onFirmChange(e.target.value)}
              className="w-full rounded-full border border-zinc-300 bg-background px-3.5 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none dark:border-zinc-700"
            >
              <option value="">All firms</option>
              {visibleFirms.map((firm) => (
                <option key={firm} value={firm}>
                  {firm}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </aside>
  );
}
