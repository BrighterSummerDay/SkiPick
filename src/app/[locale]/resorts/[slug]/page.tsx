import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/GlassCard";
import { SnowDivider } from "@/components/SnowDivider";
import { ResortWeatherCard } from "@/components/ResortWeatherCard";
import { DifficultyMark } from "@/components/DifficultyMark";
import { getLocalizedResort } from "@/lib/getLocalizedResorts";
import { resorts } from "@/lib/resorts";
import { routing } from "@/i18n/routing";
import { formatCarMin, formatShinkansenMin } from "@/lib/utils";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    resorts.map((r) => ({ locale, slug: r.slug }))
  );
}

export default async function ResortDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const [resort, t] = await Promise.all([
    getLocalizedResort(slug),
    getTranslations("detail"),
  ]);
  if (!resort) notFound();

  // Course difficulty percentages for visual bar
  const totalCourses = resort.courses.total || 1;
  const pctBeginner = Math.round((resort.courses.beginner / totalCourses) * 100);
  const pctIntermediate = Math.round((resort.courses.intermediate / totalCourses) * 100);
  const pctAdvanced = Math.round((resort.courses.advanced / totalCourses) * 100);

  // Visitor count format
  const visitorStr = resort.lastSeasonVisitors
    ? t("visitorsUnit", { count: (resort.lastSeasonVisitors / 10000).toFixed(1) })
    : "-";

  return (
    <div className="mx-auto mb-8 sm:mb-12 max-w-[1100px] px-4 sm:px-8">
      {/* 头部标题与描述 */}
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

      {/* 标签 */}
      <div className="mt-6 sm:mt-8 flex flex-wrap gap-1.5 sm:gap-2 justify-center">
        {resort.tags.map((tag) => (
          <span key={tag} className="px-3 py-1 rounded-full bg-accent-ice/10 text-[11px] text-accent-ice">
            {tag}
          </span>
        ))}
      </div>

      {/* 加入雪场对比按钮 */}
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

      {/* 第一行：3 个核心价格与人流量卡片 (Row 1 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5 mt-6 items-stretch">
        {/* 1. 单日券价格 (标注 25-26雪季) */}
        <MetricCard
          label={t("metricBasePrice")}
          value={`¥${resort.basePrice.toLocaleString()}`}
          sub={t("seasonTag2526")}
        />

        {/* 2. 季票价格 (标注 25-26雪季) */}
        <MetricCard
          label={t("metricSeasonPassPrice")}
          value={resort.seasonPassPrice > 0 ? `¥${resort.seasonPassPrice.toLocaleString()}` : t("noSeasonPass")}
          sub={t("seasonTag2526")}
        />

        {/* 3. 雪季来场人数 (标注 25-26雪季) */}
        <MetricCard
          label={t("metricLastVisitors")}
          value={visitorStr}
          sub={t("seasonTag2526")}
        />
      </div>

      {/* 第二行：交通卡片 + 雪道与缆车综合卡片 (Row 2 Grid) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-10 items-stretch">

        {/* 1. 雪场交通卡片 (Transport Card) */}
        <GlassCard className="p-6 h-full flex flex-col justify-between" frost={false}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[15px]">
                {t("sectionTravel")}
              </h3>
              <span className="text-[11px] text-ink-faint">{t("metricTravel")}</span>
            </div>

            <ul className="mt-5 space-y-4 text-xs sm:text-sm">
              <li className="flex flex-col gap-1 pb-3 border-b border-white/10">
                <div className="flex items-center justify-between text-ink-muted">
                  <span className="font-medium text-ink-main">
                    {t("travelShinkansen")}
                  </span>
                  <span className="font-data font-bold text-accent-ice">
                    {resort.travel.shinkansenMin > 0
                      ? formatShinkansenMin(resort.travel.shinkansenMin, locale)
                      : t("noShinkansen")}
                  </span>
                </div>
                {resort.travel.shinkansenMin > 0 && (
                  <div className="flex justify-end text-[12px] text-ink-faint">
                    {t("shinkansenPriceApprox", { price: resort.travel.shinkansenYen.toLocaleString() })}
                  </div>
                )}
              </li>

              <li className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-ink-muted">
                  <span className="font-medium text-ink-main">
                    {t("travelCar")}
                  </span>
                  <span className="font-data font-bold text-accent-ice">
                    {formatCarMin(resort.travel.carMin, locale)}
                  </span>
                </div>
                <div className="flex justify-end text-[12px] text-ink-faint">
                  {t("carPriceApprox", { km: resort.travel.carKm, price: resort.travel.etcYen.toLocaleString() })}
                </div>
              </li>
            </ul>
          </div>
        </GlassCard>

        {/* 2. 雪道与缆车综合卡片 (Combined Slopes & Lifts Card) */}
        <GlassCard className="p-6 lg:col-span-2 h-full flex flex-col justify-between" frost={false}>
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[15px]">
                {t("sectionCoursesLifts")}
              </h3>
              <span className="text-[12px] font-data text-accent-ice font-bold">
                {t("coursesHeaderSub", { total: resort.courses.total, km: resort.courses.longestKm })}
              </span>
            </div>

            {/* 难度结构可视化进度条 */}
            <div className="mt-4">
              <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden flex">
                <div style={{ width: `${pctBeginner}%`, background: "var(--piste-green)" }} title={`${t("courseBeginner")} ${pctBeginner}%`} />
                <div style={{ width: `${pctIntermediate}%`, background: "var(--piste-red)" }} title={`${t("courseIntermediate")} ${pctIntermediate}%`} />
                <div style={{ width: `${pctAdvanced}%`, background: "var(--piste-black)" }} title={`${t("courseAdvanced")} ${pctAdvanced}%`} />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <DifficultyMark level="beginner" size={8} />
                  <span>{t("courseBeginner")}</span>
                  <span className="font-data font-bold text-ink-main ml-auto">
                    {t("courseCountWithPct", { count: resort.courses.beginner, pct: pctBeginner })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <DifficultyMark level="intermediate" size={8} />
                  <span>{t("courseIntermediate")}</span>
                  <span className="font-data font-bold text-ink-main ml-auto">
                    {t("courseCountWithPct", { count: resort.courses.intermediate, pct: pctIntermediate })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <DifficultyMark level="advanced" size={8} />
                  <span>{t("courseAdvanced")}</span>
                  <span className="font-data font-bold text-ink-main ml-auto">
                    {t("courseCountWithPct", { count: resort.courses.advanced, pct: pctAdvanced })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span className="text-ink-muted">
                {t("travelLifts")}
              </span>
              <span className="font-data font-bold text-base">
                {t("liftsCountUnit", { count: resort.lifts.total })}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span className="text-ink-muted">
                {t("travelGondola")}
              </span>
              <span className="font-data font-bold text-base">
                {t("liftsCountUnit", { count: resort.lifts.gondola })}
              </span>
            </div>
          </div>
        </GlassCard>

      </div>

      {/* 第三行：实时天气 (占2列) + 海拔落差 (占1列) (Row 3 Grid with strictly equal height) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mt-6 items-stretch">
        {/* 1. 实时天气卡片 (占 2 列) */}
        <div className="lg:col-span-2 h-full">
          <ResortWeatherCard
            lat={resort.lat}
            lng={resort.lng}
            topM={resort.elevation.topM}
            labels={{
              title: t("weatherTitle"),
              loading: t("weatherLoading"),
              error: t("weatherError"),
              temperature: t("weatherTemp"),
              apparentTemp: t("weatherApparentTemp"),
              snowfall: t("weatherSnowfall"),
              windSpeed: t("weatherWindSpeed"),
              updatedAt: t("weatherUpdatedAt"),
              topElevationText: t("weatherTopElevation", { topM: resort.elevation.topM }),
              conditions: t.raw("weatherConditions"),
            }}
          />
        </div>

        {/* 2. 海拔落差卡片 (占 1 列，高度完全对齐天气卡片) */}
        <GlassCard className="p-6 h-full flex flex-col justify-between" frost={false}>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[15px]">{t("metricVertical")}</h3>
            <span className="text-[11px] text-ink-faint font-data">Elevation</span>
          </div>

          <div className="my-auto py-3">
            <div className="font-data text-4xl sm:text-5xl font-black tracking-tight text-accent-ice">
              {resort.elevation.verticalM}m
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs mt-auto">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span className="text-ink-muted">{t("topElevation")}</span>
              <span className="font-data font-semibold text-ink-main">{resort.elevation.topM}m</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5">
              <span className="text-ink-muted">{t("baseElevation")}</span>
              <span className="font-data font-semibold text-ink-main">{resort.elevation.baseM}m</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* 第四行：夜场与地形公园设施卡片 (Facilities Card) */}
      <GlassCard className="p-6 mt-6" frost={false}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[15px]">{t("sectionFacilities")}</h3>
          <span className="text-[11px] text-ink-faint font-data">Features</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {/* 夜场营业 */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink-main text-[15px]">{t("nightSkiingTitle")}</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${resort.hasNightSkiing ? "bg-accent-ice/10 text-accent-ice" : "bg-black/5 text-ink-faint"}`}>
                {resort.hasNightSkiing ? t("hasNightSkiingYes") : t("hasNightSkiingNo")}
              </span>
            </div>
            {resort.hasNightSkiing && resort.nightSkiingHours && (
              <div className="text-xs text-ink-muted flex items-center justify-between pt-2.5 border-t border-white/10">
                <span>{t("nightSkiingHours")}</span>
                <span className="font-data font-bold text-accent-ice">{resort.nightSkiingHours}</span>
              </div>
            )}
          </div>

          {/* 地形公园 */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink-main text-[15px]">{t("snowParkTitle")}</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${resort.hasPark ? "bg-accent-ice/10 text-accent-ice" : "bg-black/5 text-ink-faint"}`}>
                {resort.hasPark ? t("hasParkYes") : t("hasParkNo")}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>

      <br />

      {/* 4. 社区现场反馈 */}
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
    <GlassCard className="p-6 h-full flex flex-col justify-between" frost={false}>
      <span className="text-xs text-ink-muted">{label}</span>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="font-data text-2xl sm:text-3xl font-bold">{value}</span>
      </div>
      {sub && <div className="mt-1 text-[11px] text-ink-faint">{sub}</div>}
    </GlassCard>
  );
}
