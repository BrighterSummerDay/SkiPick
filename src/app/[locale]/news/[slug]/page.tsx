import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/GlassCard";
import { getLocalizedNews } from "@/lib/getLocalizedNews";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const [t, news] = await Promise.all([getTranslations("news"), getLocalizedNews()]);
  const item = news.find((entry) => entry.slug === slug);

  if (!item) notFound();

  return (
    <div className="mx-4 sm:mx-8 mb-8 sm:mb-12 max-w-[1040px] md:mx-auto">
      <Link
        href="/news"
        className="inline-flex items-center rounded-full border border-accent-ice/20 bg-white/10 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-accent-ice transition-colors hover:bg-accent-ice hover:text-white"
      >
        ← {t("backHome")}
      </Link>

      <GlassCard className="mt-4 sm:mt-6 p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-accent-ice/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-accent-ice">
            {item.categoryLabel}
          </span>
          <span className="font-data text-[11px] text-ink-faint">{item.publishedAt}</span>
        </div>

        <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-black tracking-tight">{item.title}</h1>
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-ink-muted">{item.content}</p>
      </GlassCard>
    </div>
  );
}
