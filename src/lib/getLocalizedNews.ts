import { getTranslations } from "next-intl/server";
import { newsSeed } from "./news";

export type LocalizedNewsItem = {
  slug: string;
  publishedAt: string;
  category: string;
  categoryLabel: string;
  title: string;
  excerpt: string;
  content: string;
};

export async function getLocalizedNews(): Promise<LocalizedNewsItem[]> {
  const t = await getTranslations("news");

  return [...newsSeed]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((item) => ({
      ...item,
      categoryLabel: t(`categories.${item.category}`),
      title: t(`${item.slug}.title`),
      excerpt: t(`${item.slug}.excerpt`),
      content: t(`${item.slug}.content`),
    }));
}
