export const newsSeed = [
  { slug: "2026-08-06", publishedAt: "2026-08-06", category: "announcement" },
  { slug: "site-refresh-2026-08", publishedAt: "2026-08-05", category: "changelog" },
  { slug: "compare-flow-update", publishedAt: "2026-07-20", category: "changelog" },
  { slug: "map-guidance-update", publishedAt: "2026-06-18", category: "changelog" },
] as const;

export type NewsSeedItem = (typeof newsSeed)[number];
export type NewsCategory = NewsSeedItem["category"];
