"use client";

import { useState } from "react";
import type { Article } from "@/types/article";
import { NewsFeed } from "./NewsFeed";
import { MarketSignalPlaceholder } from "./MarketSignalPlaceholder";

const SECTIONS = [
  { id: "news", label: "News" },
  { id: "market-signal", label: "Market Signal" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export function AppShell({ articles }: { articles: Article[] }) {
  const [activeSection, setActiveSection] = useState<SectionId>("news");

  return (
    <div className="flex flex-col">
      <div className="flex gap-2 border-b border-zinc-200 px-6 py-4 sm:px-10 lg:px-16 dark:border-zinc-800">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              activeSection === section.id
                ? "border-foreground bg-foreground text-background"
                : "border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-foreground dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500"
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === "news" ? <NewsFeed articles={articles} /> : <MarketSignalPlaceholder />}
    </div>
  );
}
