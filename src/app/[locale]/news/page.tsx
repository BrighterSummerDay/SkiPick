import { getTranslations } from "next-intl/server";
import { NewsCard } from "@/components/NewsCard";
import { getLocalizedNews } from "@/lib/getLocalizedNews";

export default async function NewsPage() {
  const [t, news] = await Promise.all([getTranslations("news"), getLocalizedNews()]);

  return (
    <div className="mx-auto max-w-[1040px] px-4 sm:px-8 mb-8 sm:mb-12">

      <div className="grid gap-4 sm:gap-6">
        {news.map((item) => (
          <NewsCard key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
}
