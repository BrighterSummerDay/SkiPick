"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MapSkeleton } from "@/components/MapSkeleton";
import { GlassCard } from "@/components/GlassCard";
import { REGIONS } from "@/lib/regions";
import { useLocalizedResorts } from "@/lib/useLocalizedResorts";
import { formatCarMin, formatShinkansenMin } from "@/lib/utils";
import clsx from "clsx";

const ResortMap = dynamic(
  () => import("@/components/ResortMap").then((m) => m.ResortMap),
  {
    ssr: false,
    loading: () => <MapSkeleton label="正在加载探索地图..." />,
  }
);

export function HomeHero() {
  const t = useTranslations("home");
  const tr = useTranslations("regions");
  const tm = useTranslations("map");
  const trd = useTranslations("regionDetails");
  const locale = useLocale();
  const resorts = useLocalizedResorts();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isCardDismissed, setIsCardDismissed] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

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
    <div className="flex flex-col">
      {/* ── 移动端专属：常规文档流中的 Hero 标题卡片（避免与地图重叠） ── */}
      <div className="block sm:hidden mb-3">
        <GlassCard strong className="p-4 border border-white/80 shadow-xs" frost={false}>
          <span className="font-data text-[11px] tracking-[0.2em] uppercase text-accent-ice font-bold">
            {t("eyebrow")}
          </span>
          <h1 className="mt-1 text-xl font-black tracking-tight leading-snug">
            {t("titleLine1")}
            {t("titleLine2")}
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-ink-muted">
            {t("subtitle")}
          </p>
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <Link
              href="/map"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-accent-ice border border-accent-ice/30 bg-accent-ice/10 hover:bg-accent-ice hover:text-white transition-colors"
            >
              {t("ctaMap")}
            </Link>
            <Link
              href="/compare"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-accent-ice border border-accent-ice/30 bg-accent-ice/10 hover:bg-accent-ice hover:text-white transition-colors"
            >
              {t("ctaCompare")}
            </Link>
            <Link
              href="/resorts"
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-accent-ice border border-accent-ice/30 bg-accent-ice/10 hover:bg-accent-ice hover:text-white transition-colors"
            >
              {t("ctaResorts")}
            </Link>
          </div>
        </GlassCard>
      </div>

      {/* ── 地图主体区域 ── */}
      <section className="relative h-[380px] xs:h-[440px] sm:h-[calc(100vh-var(--header-offset)-40px)] sm:min-h-[440px] sm:max-h-[620px] rounded-[20px] sm:rounded-[32px] overflow-hidden border border-white/60 shadow-md sm:shadow-lg">
        {/* 地图组件 */}
        <ResortMap
          selectedSlug={selectedSlug}
          onSelect={(slug) => {
            setSelectedSlug(slug);
            setIsMobileExpanded(false);
            if (slug) {
              const r = resorts.find((res) => res.slug === slug);
              if (r) setSelectedRegion(r.regionId);
            }
          }}
          activeRegion={selectedRegion}
          onRegionSelect={(regId) => {
            setSelectedRegion(regId);
            setIsMobileExpanded(false);
            if (!regId) setSelectedSlug(null);
          }}
          names={names}
          regionNames={regionNames}
          backLabel={tm("backToOverview")}
          backToRegionLabel={tm("backToRegion")}
          backButtonPosition="hero-right"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg)]/80 via-transparent to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--bg)]/70 via-transparent to-transparent hidden sm:block" />

        {/* ── 桌面端专属：悬浮在地图左侧的 Hero 标题卡片 ── */}
        <div className="hidden sm:block absolute left-4 top-4 sm:left-6 sm:top-6 lg:left-8 lg:top-8 max-w-[380px] sm:max-w-[440px] lg:max-w-[460px] pointer-events-auto z-10">
          <GlassCard strong className="p-5 sm:p-6 lg:p-7" frost={false}>
            <span className="font-data text-xs tracking-[0.25em] uppercase text-accent-ice font-bold">
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

        {/* ── 桌面端专属：右侧详情抽屉 ── */}
        {!isCardDismissed && activeResort ? (
          <div className="hidden sm:flex absolute right-3.5 sm:right-4 top-[74px] bottom-9 w-[280px] sm:w-[320px] z-20 pointer-events-auto flex-col">
            <GlassCard strong className="p-4 sm:p-5 flex-1 flex flex-col overflow-y-auto" frost={false}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] text-ink-faint">{activeResort.region}</span>
                  <h3 className="mt-0.5 text-base sm:text-lg font-black">{activeResort.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCardDismissed(true)}
                  className="w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-ink-muted hover:text-ink text-xs transition-colors shrink-0 cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
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
        ) : !isCardDismissed && selectedRegion && regionDetail ? (
          <div className="hidden sm:flex absolute right-3.5 sm:right-4 top-[74px] bottom-9 w-[280px] sm:w-[320px] z-20 pointer-events-auto flex-col">
            <GlassCard strong className="p-4 sm:p-5 flex-1 flex flex-col overflow-y-auto" frost={false}>
              <div className="pb-2.5 border-b border-white/60 flex items-start justify-between gap-2">
                <h3 className="text-base sm:text-lg font-black">{regionDetail.title}</h3>
                <button
                  type="button"
                  onClick={() => setIsCardDismissed(true)}
                  className="w-6 h-6 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-ink-muted hover:text-ink text-xs transition-colors shrink-0 cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
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

        {/* ── 移动端专属：底部半高抽屉 (Bottom Sheet) ── */}
        {!isCardDismissed && activeResort ? (
          <div className="sm:hidden absolute bottom-2 inset-x-2 z-30 pointer-events-auto">
            <GlassCard
              strong
              className={clsx(
                "p-3.5 transition-all duration-300 flex flex-col shadow-2xl border border-white/90 bg-white/95 backdrop-blur-xl rounded-2xl",
                isMobileExpanded ? "max-h-[330px] overflow-y-auto" : "max-h-[200px] overflow-hidden"
              )}
              frost={false}
            >
              {/* 顶部标题栏 + 展开/关闭操作 */}
              <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-sky-100/90">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-ink-faint">{activeResort.region}</span>
                  <h3 className="text-sm font-black text-ink truncate">{activeResort.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsMobileExpanded((v) => !v)}
                    className="px-2 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-ink-muted text-[10px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>{isMobileExpanded ? "收起" : "更多"}</span>
                    <svg
                      className={clsx("w-3 h-3 transition-transform duration-200", isMobileExpanded ? "rotate-180" : "")}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCardDismissed(true)}
                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-50 text-ink-muted hover:text-red-500 flex items-center justify-center text-xs transition-colors"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 核心数据三列展示（Peek 模式与展开模式均清晰可见） */}
              <div className="grid grid-cols-3 gap-2 py-2 text-[11px] border-b border-sky-100/80">
                <div className="flex flex-col">
                  <span className="text-[10px] text-ink-muted">{tm("statBasePrice")}</span>
                  <span className="font-data font-bold text-accent-ice">¥{activeResort.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-ink-muted">{tm("statCarLabel")}</span>
                  <span className="font-data font-semibold text-ink truncate">
                    {formatCarMin(activeResort.travel.carMin, locale)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-ink-muted">{tm("statCourses")}</span>
                  <span className="font-data font-semibold text-ink">{activeResort.courses.total} 条</span>
                </div>
              </div>

              {/* 展开时显示的更多信息 */}
              {isMobileExpanded && (
                <div className="py-2 space-y-1.5 text-xs text-ink-muted animate-fadeIn">
                  <p className="text-[11px] leading-relaxed line-clamp-2">{activeResort.summary}</p>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-ink-muted">{tm("statVertical")}</span>
                    <span className="font-data font-semibold text-ink">{activeResort.elevation.verticalM}m</span>
                  </div>
                  {activeResort.travel.shinkansenMin > 0 && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-ink-muted">{tm("statShinkansenLabel")}</span>
                      <span className="font-data font-semibold text-ink">
                        {formatShinkansenMin(activeResort.travel.shinkansenMin, locale)} · ¥{activeResort.travel.shinkansenYen.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {activeResort.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-accent-ice/10 text-[10px] text-accent-ice font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 底部跳转按钮 */}
              <div className="pt-2 flex items-center gap-2 mt-auto">
                <Link
                  href={`/resorts/${activeResort.slug}`}
                  className="flex-1 py-1.5 rounded-full text-center text-xs font-semibold text-accent-ice border border-accent-ice/30 bg-accent-ice/5 hover:bg-accent-ice hover:text-white transition-colors"
                >
                  {tm("viewDetail")}
                </Link>
                <Link
                  href={`/compare?resorts=${compareQuery}`}
                  className="flex-1 py-1.5 rounded-full text-center text-xs font-semibold text-accent-ice border border-accent-ice/30 bg-accent-ice/5 hover:bg-accent-ice hover:text-white transition-colors"
                >
                  {tm("compareResort")}
                </Link>
              </div>
            </GlassCard>
          </div>
        ) : !isCardDismissed && selectedRegion && regionDetail ? (
          <div className="sm:hidden absolute bottom-2 inset-x-2 z-30 pointer-events-auto">
            <GlassCard
              strong
              className={clsx(
                "p-3.5 transition-all duration-300 flex flex-col shadow-2xl border border-white/90 bg-white/95 backdrop-blur-xl rounded-2xl",
                isMobileExpanded ? "max-h-[290px] overflow-y-auto" : "max-h-[180px] overflow-hidden"
              )}
              frost={false}
            >
              {/* 顶部标题与操作 */}
              <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-sky-100/90">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-accent-ice font-bold uppercase tracking-wider">
                    {tm("regionBadge") || "大区域概览"}
                  </span>
                  <h3 className="text-sm font-black text-ink truncate">{regionDetail.title}</h3>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsMobileExpanded((v) => !v)}
                    className="px-2 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-ink-muted text-[10px] font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>{isMobileExpanded ? "收起" : "更多"}</span>
                    <svg
                      className={clsx("w-3 h-3 transition-transform duration-200", isMobileExpanded ? "rotate-180" : "")}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCardDismissed(true)}
                    className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-50 text-ink-muted hover:text-red-500 flex items-center justify-center text-xs transition-colors"
                    title="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* 核心数据 */}
              <div className="grid grid-cols-3 gap-2 py-2 text-[11px] border-b border-sky-100/80">
                <div className="flex flex-col">
                  <span className="text-[10px] text-ink-muted">{tm("resortCountLabel")}</span>
                  <span className="font-data font-bold text-ink">{resortsInRegion.length} 座</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-ink-muted">{tm("carKmRangeLabel")}</span>
                  <span className="font-data font-semibold text-ink truncate">
                    {minCarKm === maxCarKm ? `${minCarKm}km` : `${minCarKm}~${maxCarKm}km`}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-ink-muted">{tm("carTimeRangeLabel")}</span>
                  <span className="font-data font-semibold text-ink truncate">
                    {minCarMin === maxCarMin
                      ? formatCarMin(minCarMin, locale)
                      : `${formatCarMin(minCarMin, locale)}~${formatCarMin(maxCarMin, locale)}`}
                  </span>
                </div>
              </div>

              {/* 展开时显示的描述与标签 */}
              {isMobileExpanded && (
                <div className="py-2 space-y-1.5 text-xs text-ink-muted animate-fadeIn">
                  <p className="text-[11px] leading-relaxed">{regionDetail.summary}</p>
                  {regionDetail.tags && regionDetail.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {regionDetail.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-accent-ice/10 text-[10px] text-accent-ice font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          </div>
        ) : null}

        {/* ── 当详情卡片被 ✕ 关闭时，提供轻巧的「重新展开卡片」小胶囊 ── */}
        {isCardDismissed && (activeResort || (selectedRegion && regionDetail)) ? (
          <>
            {/* 移动端胶囊 */}
            <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsCardDismissed(false)}
                className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-accent-ice/40 shadow-lg text-xs font-semibold text-accent-ice flex items-center gap-1.5 hover:bg-white active:scale-95 transition-all cursor-pointer"
              >
                <span>📍 {activeResort ? activeResort.name : regionDetail?.title}</span>
                <span className="text-[10px] text-ink-muted font-normal">· 查看卡片</span>
              </button>
            </div>
            {/* 桌面端胶囊 */}
            <div className="hidden sm:block absolute right-4 bottom-6 z-20 pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsCardDismissed(false)}
                className="px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md border border-accent-ice/40 shadow-lg text-xs font-semibold text-accent-ice flex items-center gap-1.5 hover:bg-white active:scale-95 transition-all cursor-pointer"
              >
                <span>📍 {activeResort ? activeResort.name : regionDetail?.title}</span>
                <span className="text-[10px] text-ink-muted font-normal">· 查看卡片</span>
              </button>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
