"use client";

import { useTranslations } from "next-intl";
import { NewsCard } from "@/components/NewsCard";
import { ScrollGuideLayout } from "@/components/ScrollGuideLayout";
import type { LocalizedNewsItem } from "@/lib/getLocalizedNews";

export function NewsList({ news }: { news: LocalizedNewsItem[] }) {
  const t = useTranslations("news");

  return (
    <ScrollGuideLayout
      scrollMoreText={t("scrollMore")}
      reachedBottomText={t("reachedBottom")}
    >
      <div className="grid gap-4 sm:gap-6 w-full">
        {news.map((item) => (
          <NewsCard key={item.slug} item={item} />
        ))}
      </div>
    </ScrollGuideLayout>
  );
}
