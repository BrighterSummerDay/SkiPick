import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/GlassCard";
import { SnowDivider } from "@/components/SnowDivider";
import { getLocalizedResort } from "@/lib/getLocalizedResorts";
import { resorts } from "@/lib/resorts";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    resorts.map((r) => ({ locale, slug: r.slug }))
  );
}

export default async function ResortDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [resort, t] = await Promise.all([
    getLocalizedResort(slug),
    getTranslations("detail"),
  ]);
  if (!resort) notFound();

  return (
    <div className="mx-auto mb-8 sm:mb-12 max-w-[1100px] px-4 sm:px-8">
      <div className="mx-auto flex max-w-[760px] flex-col gap-1.5 sm:gap-2 text-center">
        <span className="text-xs text-ink-faint">{resort.region}</span>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{resort.name}</h1>
        <p className="text-xs sm:text-sm text-ink-faint">{resort.nameJa}</p>
      </div>

      <div className="mx-auto mt-4 sm:mt-6 max-w-[760px] text-center">
        <p className="text-xs sm:text-[15px] leading-relaxed text-ink-muted">
          {resort.summary}
        </p>
      </div>

      {/* 小标签 */}
      <div className="mt-6 sm:mt-8 flex flex-wrap gap-1.5 sm:gap-2 justify-center">
        {resort.tags.map((tag) => (
          <span key={tag} className="px-3 py-1 rounded-full bg-accent-ice/10 text-[11px] text-accent-ice">
            {tag}
          </span>
        ))}
      </div>

      {/* 加入雪场对比 */}
      <div className="mt-6 sm:mt-8 flex justify-center">
        <Link
          href="/compare"
          className="inline-flex items-center justify-center rounded-full border border-accent-ice/20 bg-white/10 px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-medium text-accent-ice hover:bg-accent-ice hover:text-white transition-colors"
        >
          {t("addToCompare")}
        </Link>
      </div>

      <div className="my-6">
        <SnowDivider label="Overview" />
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-4 mt-6">
        <MetricCard label={t("metricBasePrice")} value={`¥${resort.basePrice.toLocaleString()}`} />
        <MetricCard
          label={t("metricTravel")}
          value={
            resort.travel.shinkansenMin
              ? `${resort.travel.shinkansenMin} 分`
              : `${resort.travel.carMin} 分`
          }
          sub={resort.travel.shinkansenMin ? t("metricTravelSubShinkansen") : t("metricTravelSubCar")}
        />
        <MetricCard label={t("metricCourses")} value={`${resort.courses.total}`} />
        <MetricCard label={t("metricVertical")} value={`${resort.elevation.verticalM}m`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mt-10">
        <GlassCard className="p-6" frost={false}>
          <h3 className="font-bold text-[15px]">{t("sectionCourses")}</h3>
          <ul className="mt-4 space-y-3">
            <DetailRow label={t("courseBeginner")} value={`${resort.courses.beginner}`} color="var(--piste-green)" />
            <DetailRow
              label={t("courseIntermediate")}
              value={`${resort.courses.intermediate}`}
              color="var(--piste-red)"
            />
            <DetailRow label={t("courseAdvanced")} value={`${resort.courses.advanced}`} color="var(--piste-black)" />
            <DetailRow label={t("courseLongest")} value={`${resort.courses.longestKm}km`} />
          </ul>
        </GlassCard>

        <GlassCard className="p-6" frost={false}>
          <h3 className="font-bold text-[15px]">{t("sectionTravel")}</h3>
          <ul className="mt-4 space-y-3">
            {resort.travel.shinkansenMin > 0 && (
              <DetailRow
                label={t("travelShinkansen")}
                value={`${resort.travel.shinkansenMin} 分 · ¥${resort.travel.shinkansenYen.toLocaleString()}`}
              />
            )}
            <DetailRow label={t("travelCar")} value={`${resort.travel.carMin} 分 · ${resort.travel.carKm}km`} />
            <DetailRow label={t("travelLifts")} value={`${resort.lifts.total}`} />
            <DetailRow label={t("travelGondola")} value={`${resort.lifts.gondola}`} />
          </ul>
        </GlassCard>
      </div>

      <br/>

      <SnowDivider label={t("sectionCommunity")} />
      <GlassCard className="p-6 mt-8" frost={false}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h3 className="font-bold text-[15px]">{t("communityTitle")}</h3>
            <span className="text-xs text-ink-faint">{t("communityBadge")}</span>
          </div>
          <p className="text-[13px] text-ink-muted">{t("communityPlaceholder")}</p>
        </div>
      </GlassCard>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <GlassCard className="p-5" frost={false}>
      <span className="text-xs text-ink-muted">{label}</span>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-data text-2xl font-bold">{value}</span>
        {sub && <span className="text-[11px] text-ink-faint">{sub}</span>}
      </div>
    </GlassCard>
  );
}

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-ink-muted">
        {color && (
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: color }}
          />
        )}
        {label}
      </span>
      <span className="font-data font-medium">{value}</span>
    </li>
  );
}
