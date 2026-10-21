"use client";

import { useMemo, useState } from "react";
import type { Article } from "@/types/article";
import { RelativeTime } from "./RelativeTime";
import { FullDateTime } from "./FullDateTime";
import { useReadArticles } from "@/lib/useReadArticles";
import { Eyebrow, RadioRow, CheckboxRow } from "./FilterSidebar";

const TIME_TABS = [
  { id: "24h", label: "Past 24 Hours", ms: 24 * 60 * 60 * 1000 },
  { id: "week", label: "Past Week", ms: 7 * 24 * 60 * 60 * 1000 },
  { id: "month", label: "Past Month", ms: 31 * 24 * 60 * 60 * 1000 },
] as const;

type TimeTabId = (typeof TIME_TABS)[number]["id"];

// Each signal is a heuristic keyword/regex pass over the full merged dataset (all GNews, NYT,
// and RSS articles), the same approach used for the News tab's Funding Rounds view — these are
// directional signals, not a strict taxonomy, so false negatives are expected on vaguely worded headlines.
type SignalType = { id: string; label: string; description: string; matches: (text: string) => boolean };

const AI_CONTEXT_REGEX = /\bAI\b|artificial intelligence|machine learning|\bLLM\b|OpenAI|Anthropic|generative AI/i;
const FOUNDER_EXIT_REGEX =
  /\b(founder|co-founder|ceo)\b[^.]{0,60}\b(steps? down|stepping down|resigns?|resigned|removed|ousted|fired|departs?|departing|exits?|leaving|forced out)\b/i;
const FOUNDER_NEWCO_REGEX =
  /\b(founder|co-founder|ex-ceo|former ceo)\b[^.]{0,60}\b(launches?|launching|starts?|starting|founds?|founding|unveils?)\b[^.]{0,30}\b(startup|company|venture)\b/i;

function regexSignal(text: string, regex: RegExp): boolean {
  return regex.test(text);
}

const SIGNAL_TYPES: SignalType[] = [
  {
    id: "ai-founder",
    label: "AI Founder Moves",
    description: "An AI company founder is removed, steps down, or launches a new company.",
    // Checked as two independent conditions (not one combined regex) — a lookahead anchored to
    // the founder-related match position can't "see" AI context that appears earlier in the text.
    matches: (text) => AI_CONTEXT_REGEX.test(text) && (FOUNDER_EXIT_REGEX.test(text) || FOUNDER_NEWCO_REGEX.test(text)),
  },
  {
    id: "public-private",
    label: "Public ↔ Private Deals",
    description: "Public companies investing in, acquiring, or taking stakes in private companies.",
    matches: (text) =>
      regexSignal(
        text,
        /\b(NYSE|NASDAQ|publicly[- ]traded|public company)\b[^.]{0,80}\b(invests?( in)?|acquir\w+|buys?|takes? a stake|stake in)\b[^.]{0,60}\b(privately[- ]held|private company|startup)\b/i
      ),
  },
  {
    id: "leadership",
    label: "Leadership Move",
    description: "Executive appointments, resignations, or departures at PE/VC-backed companies.",
    matches: (text) =>
      regexSignal(
        text,
        /\b(CEO|CFO|COO|president|chairman|managing partner)\b[^.]{0,50}\b(named|appointed|resigns?|steps? down|departs?|hired|joins as|takes? over as|to replace)\b/i
      ),
  },
  {
    id: "layoffs",
    label: "Layoffs",
    description: "Workforce reductions at startups or portfolio companies.",
    matches: (text) =>
      regexSignal(
        text,
        /\blayoffs?\b|\bjob cuts\b|\bworkforce reduction\b|\blays? off\b|\bcuts? \d+%? of (its |their )?(staff|workforce|jobs)\b/i
      ),
  },
  {
    id: "down-round",
    label: "Down Round",
    description: "Valuation write-downs or funding rounds priced below a company's prior valuation.",
    matches: (text) =>
      regexSignal(text, /\bdown round\b|\bwrite-?down\b|\bmarked down\b|valuation cut|valued at.{0,20}(lower|less than|down from)/i),
  },
  {
    id: "distress",
    label: "Distress",
    description: "Bankruptcy filings, debt restructuring, or defaults at portfolio companies.",
    matches: (text) =>
      regexSignal(text, /\bbankrupt(cy)?\b|\bchapter 11\b|\bdebt restructuring\b|\bdefault(s|ed)?\b[^.]{0,20}\bdebt\b|\bdistressed\b/i),
  },
  {
    id: "regulatory",
    label: "Regulatory Action",
    description: "Antitrust or national-security reviews affecting PE/VC deals.",
    matches: (text) =>
      regexSignal(text, /\bFTC\b|\bDOJ\b|\bantitrust\b|\bCFIUS\b|\bregulators?\b[^.]{0,30}\b(block|review|approve|clear)\b/i),
  },
  {
    id: "ipo-filing",
    label: "IPO Filing",
    description: "Companies filing confidentially or publicly for an IPO.",
    matches: (text) =>
      regexSignal(text, /\bfiles? (confidentially )?for (an )?IPO\b|\bfiles? (its )?S-1\b|\bfiles? for an initial public offering\b/i),
  },
  {
    id: "fund-close",
    label: "Fund Close",
    description: "PE/VC firms announcing a new fund closed, and its size.",
    matches: (text) =>
      regexSignal(
        text,
        /\bcloses? (its |a )?\$[\d.,]+\s*(million|billion)\s*fund\b|\braises? \$[\d.,]+\s*(million|billion)\s*(for|in) (its|a) (new )?fund\b|\bfinal close\b/i
      ),
  },
  {
    id: "spin-off",
    label: "Spin-Off",
    description: "Corporate carve-outs or divestitures, often into standalone PE-backed companies.",
    matches: (text) => regexSignal(text, /\bspin[- ]?off\b|\bdivest(s|iture|ing)?\b|\bcarve[- ]?out\b/i),
  },
  {
    id: "secondary",
    label: "Secondary Sale",
    description: "GP-led secondaries, continuation funds, or stake sales between PE firms.",
    matches: (text) => regexSignal(text, /\bcontinuation fund\b|\bsecondary (market|sale|transaction)\b|\bGP-led\b/i),
  },
  {
    id: "spac",
    label: "SPAC",
    description: "SPAC mergers, redemptions, or dissolutions.",
    matches: (text) =>
      regexSignal(text, /\bSPAC\b|\bspecial purpose acquisition compan(y|ies)\b|\bblank[- ]check compan(y|ies)\b|\bde-SPAC\b/i),
  },
];

function matchingSignals(article: Article): SignalType[] {
  const text = `${article.title} ${article.summary}`;
  return SIGNAL_TYPES.filter((s) => s.matches(text));
}

export function MarketSignalFeed({ articles }: { articles: Article[] }) {
  const [activeTab, setActiveTab] = useState<TimeTabId>("week");
  const [selectedSignals, setSelectedSignals] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const { readIds, markAsRead } = useReadArticles();

  const toggleSignal = (id: string) => {
    setSelectedSignals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const signalArticles = useMemo(() => {
    return articles
      .map((article) => ({ article, signals: matchingSignals(article) }))
      .filter((entry) => entry.signals.length > 0);
  }, [articles]);

  const filtered = useMemo(() => {
    const tab = TIME_TABS.find((t) => t.id === activeTab)!;
    // eslint-disable-next-line react-hooks/purity -- window cutoff is meant to reflect wall-clock time on each recompute
    const cutoff = Date.now() - tab.ms;
    const q = query.trim().toLowerCase();

    return signalArticles
      .filter(({ article }) => new Date(article.publishedAt).getTime() >= cutoff)
      .filter(
        ({ signals }) => selectedSignals.size === 0 || signals.some((s) => selectedSignals.has(s.id))
      )
      .filter(
        ({ article }) =>
          !q || article.title.toLowerCase().includes(q) || article.summary.toLowerCase().includes(q)
      )
      .sort((a, b) => new Date(b.article.publishedAt).getTime() - new Date(a.article.publishedAt).getTime());
  }, [signalArticles, activeTab, selectedSignals, query]);

  return (
    <div className="flex w-full flex-col">
      <div className="border-b border-zinc-200 px-6 py-4 sm:px-10 lg:px-16 dark:border-zinc-800">
        <h2 className="font-heading text-lg font-bold text-foreground">Market Signal</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Directional signals pulled from across every source — founder moves, public/private dealmaking,
          distress, regulation, and more.
        </p>
      </div>

      <div className="flex w-full flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-zinc-200 px-6 py-6 lg:w-72 lg:border-b-0 lg:border-r lg:px-8 dark:border-zinc-800">
          <div className="flex flex-col gap-6 lg:sticky lg:top-[88px]">
            <div>
              <Eyebrow>Time Period</Eyebrow>
              <div className="flex flex-col gap-0.5">
                {TIME_TABS.map((t) => (
                  <RadioRow key={t.id} active={activeTab === t.id} label={t.label} onClick={() => setActiveTab(t.id)} />
                ))}
              </div>
            </div>

            <div>
              <Eyebrow>Signal Type</Eyebrow>
              <div className="flex max-h-96 flex-col gap-0.5 overflow-y-auto pr-1">
                <CheckboxRow
                  checked={selectedSignals.size === 0}
                  label="All"
                  onClick={() => setSelectedSignals(new Set())}
                />
                {SIGNAL_TYPES.map((s) => (
                  <CheckboxRow
                    key={s.id}
                    checked={selectedSignals.has(s.id)}
                    label={s.label}
                    onClick={() => toggleSignal(s.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="sticky top-[72px] z-10 border-b border-zinc-200 bg-background/90 px-6 py-4 backdrop-blur sm:px-8 dark:border-zinc-800">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden
              >
                <circle cx="9" cy="9" r="6" />
                <path d="M14 14L18 18" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search headlines and summaries…"
                className="w-full rounded-full border border-zinc-300 bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-zinc-400 focus:border-accent focus:outline-none dark:border-zinc-700"
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Flags founder/leadership moves, public-private dealmaking, distress, and other directional signals.
            </p>
          </div>

          {filtered.length === 0 ? (
            <p className="px-6 py-16 text-center text-sm text-zinc-500 sm:px-8 dark:text-zinc-400">
              No market signals found in this timeframe.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filtered.map(({ article, signals }) => {
                const isRead = readIds.has(article.id);
                return (
                  <li key={article.id} className={`px-6 py-5 sm:px-8 ${isRead ? "opacity-50" : ""}`}>
                    <div className="mb-2 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {!isRead && (
                        <span className="rounded-full bg-accent px-2 py-0.5 font-bold text-white">New</span>
                      )}
                      <span>{article.sourceName}</span>
                      <span className="text-accent">·</span>
                      <RelativeTime iso={article.publishedAt} />
                      <span className="normal-case text-zinc-400 dark:text-zinc-500">
                        (<FullDateTime iso={article.publishedAt} />)
                      </span>
                      {article.sector && (
                        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {article.sector}
                        </span>
                      )}
                      {signals.map((s) => (
                        <span
                          key={s.id}
                          className="rounded-full border border-zinc-300 px-2 py-0.5 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                        >
                          {s.label}
                        </span>
                      ))}
                      {article.firms?.map((firm) => (
                        <span key={firm} className="rounded-full border border-accent/40 px-2 py-0.5 text-accent">
                          {firm}
                        </span>
                      ))}
                    </div>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markAsRead(article.id)}
                      className="block font-heading text-lg font-semibold leading-snug text-foreground hover:text-accent"
                    >
                      {article.title}
                    </a>
                    <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {article.summary}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
