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
      <div className="flex gap-8 border-b border-zinc-200 px-6 py-5 sm:px-10 lg:px-16 dark:border-zinc-800">
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
      </div>

      {activeSection === "news" ? <NewsFeed articles={articles} /> : <MarketSignalPlaceholder />}
    </div>
  );
}
