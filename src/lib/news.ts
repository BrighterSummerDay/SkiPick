export const newsSeed = [
  { slug: "2026-08-06", publishedAt: "2026-08-06", category: "changelog" },
  { slug: "site-refresh-2026-08", publishedAt: "2026-08-05", category: "announcement" },
  { slug: "compare-flow-update", publishedAt: "2026-07-20", category: "announcement" },
  { slug: "map-guidance-update", publishedAt: "2026-06-18", category: "announcement" },
] as const;

export type NewsSeedItem = (typeof newsSeed)[number];
export type NewsCategory = NewsSeedItem["category"];
