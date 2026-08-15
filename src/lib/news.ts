export const newsSeed = [
  { slug: "changelog 2026-08-06", publishedAt: "2026-08-06", category: "changelog" },
  { slug: "announcement002", publishedAt: "2026-08-05", category: "announcement" },
  { slug: "announcement001", publishedAt: "2026-08-02", category: "announcement" },
] as const;

export type NewsSeedItem = (typeof newsSeed)[number];
export type NewsCategory = NewsSeedItem["category"];
