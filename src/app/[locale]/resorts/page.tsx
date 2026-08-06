import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/GlassCard";
import { getLocalizedResorts } from "@/lib/getLocalizedResorts";

export default async function ResortsPage() {
  const [t, resorts] = await Promise.all([
    getTranslations("resortsPage"),
    getLocalizedResorts(),
  ]);

  return (
    <div className="mx-8 mb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
        <p className="mt-1.5 text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <p className="mb-6 text-sm text-ink-muted">
        {t("resortCount", { count: resorts.length })}
      </p>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 items-stretch">
        {resorts.map((resort) => (
          <GlassCard key={resort.slug} className="p-6 flex h-full flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs text-ink-faint">{resort.region}</span>
                  <h2 className="mt-2 text-xl font-black tracking-tight">{resort.name}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                    {resort.summary}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xs text-ink-faint">{t("priceLabel")}</span>
                  <div className="mt-1 text-xl font-bold">¥{resort.basePrice.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {resort.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-accent-ice/10 text-[11px] text-accent-ice"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href={`/resorts/${resort.slug}`}
                className="mt-auto inline-flex items-center justify-center w-full rounded-full px-4 py-2.5 text-sm font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors"
              >
                {t("viewDetail")}
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
