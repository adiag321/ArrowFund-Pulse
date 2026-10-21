"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pe-news:tab-last-seen";

type LastSeenMap = Record<string, string>;

function loadLastSeen(): LastSeenMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// On a user's very first visit there's no stored baseline, so every article would read as
// "new" and the badges would show a huge count. Seed all tab ids to "now" instead, so badges
// only ever reflect articles that arrived after the user has actually seen the dashboard once.
function seedLastSeen(tabIds: string[]): LastSeenMap {
  const now = new Date().toISOString();
  const seeded: LastSeenMap = {};
  tabIds.forEach((id) => {
    seeded[id] = now;
  });
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

export function useTabLastSeen(tabIds: string[]) {
  const [lastSeen, setLastSeen] = useState<LastSeenMap>({});

  useEffect(() => {
    // localStorage is only available client-side; load/seed post-mount to avoid a hydration mismatch.
    const stored = loadLastSeen();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLastSeen(Object.keys(stored).length > 0 ? stored : seedLastSeen(tabIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markSeen = useCallback((tabId: string) => {
    setLastSeen((prev) => {
      const next = { ...prev, [tabId]: new Date().toISOString() };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { lastSeen, markSeen };
}
