"use client";

import { useState } from "react";
import type { Article } from "@/types/article";
import { NewsFeed } from "./NewsFeed";
import { MarketSignalPlaceholder } from "./MarketSignalPlaceholder";
import { ThemeToggle } from "./ThemeToggle";

const SECTIONS = [
  { id: "news", label: "News" },
  { id: "market-signal", label: "Market Signal" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function AppShell({ articles }: { articles: Article[] }) {
  const [activeSection, setActiveSection] = useState<SectionId>("news");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-background/90 backdrop-blur dark:border-zinc-800">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="font-heading text-2xl font-bold uppercase leading-none tracking-tight text-foreground sm:text-3xl">
                ArrowFund <span className="text-zinc-400 dark:text-zinc-600">Pulse</span>
              </span>
            </div>
            <nav className="hidden items-center gap-6 sm:flex">
              {SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`text-sm transition-colors ${
                    activeSection === section.id
                      ? "font-semibold text-foreground"
                      : "font-medium text-zinc-500 hover:text-foreground dark:text-zinc-400"
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-zinc-500 sm:inline-flex dark:border-zinc-700 dark:text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Live · Updated Hourly
            </span>
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-col gap-3 px-6 pb-5 sm:px-10 lg:px-16">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Real-time intelligence on private equity and venture capital deals.
          </p>
          <nav className="flex items-center gap-6 sm:hidden">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`text-sm transition-colors ${
                  activeSection === section.id
                    ? "font-semibold text-foreground"
                    : "font-medium text-zinc-500 hover:text-foreground dark:text-zinc-400"
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="bg-background">
        {activeSection === "news" ? <NewsFeed articles={articles} /> : <MarketSignalPlaceholder />}
      </main>
    </div>
  );
}
