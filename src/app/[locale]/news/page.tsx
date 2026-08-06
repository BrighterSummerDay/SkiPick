import { getTranslations } from "next-intl/server";
import { NewsCard } from "@/components/NewsCard";
import { getLocalizedNews } from "@/lib/getLocalizedNews";

export default async function NewsPage() {
  const [t, news] = await Promise.all([getTranslations("news"), getLocalizedNews()]);

  return (
    <div className="mx-auto max-w-[1040px] px-8 mb-12">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t("pageTitle")}</h1>
          <p className="mt-2 text-sm text-ink-muted">{t("pageSubtitle")}</p>
        </div>
      </div>

      <div className="grid gap-6">
        {news.map((item) => (
          <NewsCard key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
}
