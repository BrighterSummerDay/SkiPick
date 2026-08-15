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
    <div className="mx-4 sm:mx-8 mb-8 sm:mb-12">
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
        {resorts.map((resort) => (
          <GlassCard key={resort.slug} className="p-5 sm:p-6 flex h-full flex-col">
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

            <div className="mt-6 flex flex-col gap-2">
              {/* 第一行：设施标签（有无夜场，有无公园） */}
              <div className="flex flex-wrap gap-2">
                {resort.hasNightSkiing ? (
                  <span className="px-3 py-1 rounded-full bg-accent-ice/10 text-[11px] text-accent-ice font-medium">
                    {t("hasNight")}{resort.nightSkiingHours ? ` (${resort.nightSkiingHours})` : ""}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-black/5 text-[11px] text-ink-faint font-medium">
                    {t("noNight")}
                  </span>
                )}

                {resort.hasPark ? (
                  <span className="px-3 py-1 rounded-full bg-accent-ice/10 text-[11px] text-accent-ice font-medium">
                    {t("hasPark")}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-black/5 text-[11px] text-ink-faint font-medium">
                    {t("noPark")}
                  </span>
                )}
              </div>

              {/* 第二行：普通特征标签 */}
              <div className="flex flex-wrap gap-2">
                {resort.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-accent-ice/10 text-[11px] text-accent-ice font-medium"
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
