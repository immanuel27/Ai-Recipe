"use client"

import * as React from "react"

// Matches the Explore grid: 2 columns, 3 from xl (1280px), 4 from 2xl (1536px)
const QUERIES: [string, number][] = [
  ["(min-width: 1536px)", 4],
  ["(min-width: 1280px)", 3],
]

function current() {
  return QUERIES.find(([q]) => window.matchMedia(q).matches)?.[1] ?? 2
}

function subscribe(onChange: () => void) {
  const lists = QUERIES.map(([q]) => window.matchMedia(q))
  lists.forEach((l) => l.addEventListener("change", onChange))
  return () => lists.forEach((l) => l.removeEventListener("change", onChange))
}

/** How many masonry columns fit the screen (2 on the server). */
export function useColumnCount() {
  return React.useSyncExternalStore(subscribe, current, () => 2)
}
