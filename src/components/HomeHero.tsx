"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ResortMap } from "@/components/ResortMap";
import { GlassCard } from "@/components/GlassCard";
import { REGIONS } from "@/lib/regions";
import { useLocalizedResorts } from "@/lib/useLocalizedResorts";
import { formatCarMin, formatShinkansenMin } from "@/lib/utils";

export function HomeHero() {
  const t = useTranslations("home");
  const tr = useTranslations("regions");
  const tm = useTranslations("map");
  const trd = useTranslations("regionDetails");
  const locale = useLocale();
  const resorts = useLocalizedResorts();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const activeResort = resorts.find((r) => r.slug === selectedSlug);
  const names = Object.fromEntries(resorts.map((r) => [r.slug, r.name]));
  const regionNames = Object.fromEntries(REGIONS.map((r) => [r.id, tr(r.id)]));
  const compareQuery = activeResort ? activeResort.slug : "";

  const resortsInRegion = selectedRegion ? resorts.filter((r) => r.regionId === selectedRegion) : [];
  const minCarKm = resortsInRegion.length ? Math.min(...resortsInRegion.map((r) => r.travel.carKm)) : 0;
  const maxCarKm = resortsInRegion.length ? Math.max(...resortsInRegion.map((r) => r.travel.carKm)) : 0;
  const minCarMin = resortsInRegion.length ? Math.min(...resortsInRegion.map((r) => r.travel.carMin)) : 0;
  const maxCarMin = resortsInRegion.length ? Math.max(...resortsInRegion.map((r) => r.travel.carMin)) : 0;

  const regionDetail =
    selectedRegion && trd.has(`${selectedRegion}.title`)
      ? {
        title: trd(`${selectedRegion}.title`),
        summary: trd(`${selectedRegion}.summary`),
        tags: trd.raw(`${selectedRegion}.tags`) as string[],
        travelInfo: trd(`${selectedRegion}.travelInfo`),
      }
      : null;

  return (
    <section className="relative h-[calc(100vh-var(--header-offset)-40px)] min-h-[440px] max-h-[620px] rounded-[24px] sm:rounded-[32px] overflow-hidden">
      {/* 地图组件，配置 Hero 卡片右侧返回按钮，无缝避开 Hero 卡片与右侧详情抽屉 */}
      <ResortMap
        selectedSlug={selectedSlug}
        onSelect={(slug) => {
          setSelectedSlug(slug);
          if (slug) {
            const r = resorts.find((res) => res.slug === slug);
            if (r) setSelectedRegion(r.regionId);
          }
        }}
        activeRegion={selectedRegion}
        onRegionSelect={(regId) => {
          setSelectedRegion(regId);
          if (!regId) setSelectedSlug(null);
        }}
        names={names}
        regionNames={regionNames}
        backLabel={tm("backToOverview")}
        backToRegionLabel={tm("backToRegion")}
        backButtonPosition="hero-right"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--bg)]/70 via-transparent to-transparent" />

      {/* 左侧 Hero 标题卡片 */}
      <div className="absolute left-4 top-4 sm:left-6 sm:top-6 lg:left-8 lg:top-8 max-w-[380px] sm:max-w-[440px] lg:max-w-[460px] pointer-events-auto z-10">
        <GlassCard strong className="p-5 sm:p-6 lg:p-7" frost={false}>
          <span className="font-data text-xs tracking-[0.25em] uppercase text-accent-ice">
            {t("eyebrow")}
          </span>
          <h1 className="mt-2.5 text-2xl sm:text-[30px] lg:text-[34px] leading-[1.25] font-black tracking-tight">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h1>
          <p className="mt-3 text-xs sm:text-[14px] lg:text-[15px] leading-relaxed text-ink-muted whitespace-pre-wrap">
            {t("subtitle")}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <Link
              href="/map"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors"
            >
              {t("ctaMap")}
            </Link>
            <Link
              href="/compare"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors"
            >
              {t("ctaCompare")}
            </Link>
            <Link
              href="/resorts"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors"
            >
              {t("ctaResorts")}
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* 右侧雪场详情抽屉 / 大区域详情抽屉（点击雪场或大区域后浮现） */}
      {activeResort ? (
        <div className="absolute right-3.5 sm:right-4 top-[74px] bottom-9 w-[280px] sm:w-[320px] z-20 pointer-events-auto flex flex-col">
          <GlassCard strong className="p-4 sm:p-5 flex-1 flex flex-col overflow-y-auto" frost={false}>
            <div>
              <span className="text-[11px] text-ink-faint">{activeResort.region}</span>
              <h3 className="mt-0.5 text-base sm:text-lg font-black">{activeResort.name}</h3>
            </div>

            <p className="mt-2.5 text-xs leading-relaxed text-ink-muted line-clamp-3">
              {activeResort.summary}
            </p>

            <div className="mt-4 space-y-2 border-t border-white/60 pt-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">{tm("statBasePrice")}</span>
                <span className="font-data font-semibold text-ink">¥{activeResort.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">{tm("statShinkansenLabel")}</span>
                <span className="font-data font-semibold text-ink">
                  {activeResort.travel.shinkansenMin > 0
                    ? tm("statShinkansenValue", {
                        time: formatShinkansenMin(activeResort.travel.shinkansenMin, locale),
                        price: activeResort.travel.shinkansenYen.toLocaleString(),
                      })
                    : tm("noShinkansen")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">{tm("statCarLabel")}</span>
                <span className="font-data font-semibold text-ink">
                  {tm("statCarValue", {
                    time: formatCarMin(activeResort.travel.carMin, locale),
                    price: activeResort.travel.etcYen.toLocaleString(),
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">{tm("statCourses")}</span>
                <span className="font-data font-semibold text-ink">
                  {tm("statCoursesValue", {
                    total: activeResort.courses.total,
                    km: activeResort.courses.longestKm,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">{tm("statVertical")}</span>
                <span className="font-data font-semibold text-ink">{activeResort.elevation.verticalM}m</span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {activeResort.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full bg-accent-ice/10 text-[11px] text-accent-ice font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-auto pt-4 flex flex-col gap-2">
              <Link
                href={`/resorts/${activeResort.slug}`}
                className="w-full py-2 rounded-full text-center text-xs font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors"
              >
                {tm("viewDetail")}
              </Link>
              <Link
                href={`/compare?resorts=${compareQuery}`}
                className="w-full py-2 rounded-full text-center text-xs font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors"
              >
                {tm("compareResort")}
              </Link>
            </div>
          </GlassCard>
        </div>
      ) : selectedRegion && regionDetail ? (
        <div className="absolute right-3.5 sm:right-4 top-[74px] bottom-9 w-[280px] sm:w-[320px] z-20 pointer-events-auto flex flex-col">
          <GlassCard strong className="p-4 sm:p-5 flex-1 flex flex-col overflow-y-auto" frost={false}>
            <div className="pb-2.5 border-b border-white/60">
              <h3 className="text-base sm:text-lg font-black">{regionDetail.title}</h3>
            </div>

            <p className="mt-2.5 text-xs leading-relaxed text-ink-muted">
              {regionDetail.summary}
            </p>

            <div className="mt-3 space-y-1.5 border-t border-white/60 pt-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">{tm("resortCountLabel")}</span>
                <span className="font-data font-semibold text-ink">{resortsInRegion.length} 座</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">{tm("carKmRangeLabel")}</span>
                <span className="font-data font-semibold text-ink">
                  {minCarKm === maxCarKm ? `${minCarKm} km` : `${minCarKm} ~ ${maxCarKm} km`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">{tm("carTimeRangeLabel")}</span>
                <span className="font-data font-semibold text-ink">
                  {minCarMin === maxCarMin
                    ? formatCarMin(minCarMin, locale)
                    : `${formatCarMin(minCarMin, locale)} ~ ${formatCarMin(maxCarMin, locale)}`}
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      ) : null}
    </section>
  );
}
