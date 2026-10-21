"use client";

import { useEffect, useState } from "react";

function formatUtc(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

function formatLocal(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

export function FullDateTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState(() => formatUtc(iso));

  useEffect(() => {
    // Recompute in the viewer's local timezone post-mount to avoid a server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLabel(formatLocal(iso));
  }, [iso]);

  return <span suppressHydrationWarning>{label}</span>;
}
