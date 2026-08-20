"use client";

import { useMemo, useState, useEffect } from "react";
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
    loading: () => <MapSkeleton label="正在加载雪场地图..." />,
  }
);

export default function MapPage() {
  const t = useTranslations("map");
  const tr = useTranslations("regions");
  const trd = useTranslations("regionDetails");
  const trp = useTranslations("resortsPage");
  const tc = useTranslations("compare");
  const locale = useLocale();
  const resorts = useLocalizedResorts();

  const [selected, setSelected] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isCardDismissed, setIsCardDismissed] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [collapsedRegions, setCollapsedRegions] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(REGIONS.map((r) => [r.id, true]))
  );
  const [searchQuery, setSearchQuery] = useState("");

  const activeResort = resorts.find((r) => r.slug === selected);
  const compareResortsQuery = activeResort ? activeResort.slug : "";
  const names = Object.fromEntries(resorts.map((r) => [r.slug, r.name]));
  const regionNames = Object.fromEntries(REGIONS.map((r) => [r.id, tr(r.id)]));

  const selectResort = (slug: string | null) => {
    setSelected(slug);
    setIsMobileExpanded(false);
    if (slug) {
      const r = resorts.find((res) => res.slug === slug);
      if (r) {
        setSelectedRegion(r.regionId);
        setCollapsedRegions((prev) => ({ ...prev, [r.regionId]: false }));
      }
    }
  };

  const selectRegion = (regId: string | null) => {
    setSelectedRegion(regId);
    setIsMobileExpanded(false);
    if (regId) {
      setCollapsedRegions((prev) => ({ ...prev, [regId]: false }));
    } else {
      setSelected(null);
    }
  };

  // 当选中的雪场或大区域发生改变时，平滑滚动聚焦到左侧列表对应项（PC 端）
  useEffect(() => {
    if (selected) {
      const timer = setTimeout(() => {
        const panel = document.getElementById("left-resort-panel");
        const el = document.getElementById(`resort-item-${selected}`);
        if (panel && el) {
          scrollToItem(panel, el);
        }
      }, 60);
      return () => clearTimeout(timer);
    } else if (selectedRegion) {
      const timer = setTimeout(() => {
        const panel = document.getElementById("left-resort-panel");
        const el = document.getElementById(`region-group-${selectedRegion}`);
        if (panel && el) {
          scrollToItem(panel, el);
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [selected, selectedRegion]);

  const filteredResorts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return resorts;
    return resorts.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.nameJa.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q)
    );
  }, [resorts, searchQuery]);

  // 按大区域分组，顺序跟着 REGIONS 配置走
  const grouped = useMemo(
    () =>
      REGIONS.map((region) => ({
        region,
        items: filteredResorts.filter((r) => r.regionId === region.id),
      })).filter((g) => g.items.length > 0),
    [filteredResorts]
  );

  const groupedResorts = useMemo(() => {
    return REGIONS.map((region) => {
      const list = resorts.filter((r) => r.regionId === region.id);
      const regionName = (tr.has(region.id) ? tr(region.id) : list[0]?.region) || region.id;
      return {
        regionId: region.id,
        regionName,
        list,
      };
    }).filter((group) => group.list.length > 0);
  }, [resorts, tr]);

  const resortsInRegion = useMemo(
    () => (selectedRegion ? resorts.filter((r) => r.regionId === selectedRegion) : []),
    [selectedRegion, resorts]
  );

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

  const toggleRegion = (regionId: string) => {
    setCollapsedRegions((prev) => ({
      ...prev,
      [regionId]: !prev[regionId],
    }));
    setSelectedRegion(regionId);
    setSelected(null);
  };

  return (
    <div
      id="map-page-container"
      className="mx-4 sm:mx-8 h-[calc(100vh-var(--header-offset)-44px)] pb-1 flex flex-col overflow-hidden"
    >
      {/* ── 移动端专属顶部控制栏 (< lg) ── */}
      <div className="lg:hidden shrink-0 mb-2 flex items-center justify-between gap-2 z-20">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white text-accent-ice border border-accent-ice/35 hover:border-accent-ice font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
        >
          <span>{tc("allResorts") || "所有雪场"} ({resorts.length})</span>
          <svg className="w-3.5 h-3.5 text-accent-ice" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="text-xs text-ink-muted font-medium truncate max-w-[200px] text-right">
          {activeResort ? (
            <span className="font-semibold text-accent-ice">{activeResort.name}</span>
          ) : selectedRegion && regionDetail ? (
            <span className="font-semibold text-accent-ice">{regionDetail.title}</span>
          ) : (
            <span className="text-ink-faint">{t("emptyHint")}</span>
          )}
        </div>
      </div>

      {/* ── 主体区域：桌面端 3 列栅格，移动端单列全开地图 ── */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] xl:grid-cols-[260px_1fr_300px] gap-3.5 sm:gap-4 h-full">
        {/* ── 左侧栏：PC 端专属 (>= lg) ── */}
        <GlassCard className="hidden lg:flex p-0 h-full min-h-0 flex-col overflow-hidden" frost={false}>
          {/* 顶部固定搜索栏 */}
          <div className="p-2.5 sm:p-3 border-b border-accent-ice/20 bg-white/70 backdrop-blur-md shrink-0 z-20">
            <div className="relative flex items-center">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-2.5 text-accent-ice pointer-events-none"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white/90 hover:bg-white focus:bg-white border-2 border-accent-ice/30 hover:border-accent-ice/60 focus:border-accent-ice focus:ring-2 focus:ring-accent-ice/20 rounded-xl outline-none transition-all placeholder:text-ink-faint text-ink font-medium shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-ink-faint hover:text-ink p-0.5 rounded-full transition-colors cursor-pointer"
                  title="Clear"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* 独立可滚动的雪场列表 */}
          <div id="left-resort-panel" className="overflow-y-auto flex-1 p-2.5 sm:p-3 min-h-0">
            {grouped.length === 0 ? (
              <div className="py-8 text-center text-ink-faint text-xs">
                {t("noSearchResult")}
              </div>
            ) : (
              grouped.map(({ region, items }) => {
                const isExpanded = searchQuery.trim() ? true : !collapsedRegions[region.id];
                return (
                  <div key={region.id} id={`region-group-${region.id}`} className="mb-3">
                    <div className="sticky top-0 z-10">
                      {/* 顶部遮罩：滑动时完全挡住上方溢出的文字 */}
                      <div className="absolute -top-2.5 sm:-top-3 -left-2.5 -right-2.5 sm:-left-3 sm:-right-3 bottom-0 bg-white/95 backdrop-blur-md rounded-t-xl -z-10 pointer-events-none" />
                      {/* 遮罩下方渐变区域 */}
                      <div className="absolute -left-2.5 -right-2.5 sm:-left-3 sm:-right-3 top-full h-3.5 bg-gradient-to-b from-white/95 via-white/40 to-transparent pointer-events-none -z-10" />
                      <button
                        type="button"
                        onClick={() => toggleRegion(region.id)}
                        className={`w-full text-left px-3.5 py-2.5 text-[11px] font-bold tracking-wide uppercase flex items-center justify-between rounded-xl backdrop-blur-md transition-all border-2 cursor-pointer ${selectedRegion === region.id
                          ? "text-accent-ice bg-white border-accent-ice shadow-xs ring-1 ring-accent-ice/20"
                          : "text-ink bg-white/80 border-accent-ice/25 hover:border-accent-ice/50 hover:bg-white shadow-2xs"
                          }`}
                      >
                        <span className="flex items-center gap-2">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : "rotate-0"
                              }`}
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                          <span>{regionNames[region.id]}</span>
                        </span>
                        <span className="text-[10px] font-semibold text-accent-ice bg-accent-ice/10 border border-accent-ice/20 px-2 py-0.5 rounded-full">
                          {items.length} 座
                        </span>
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="mt-1.5 space-y-1">
                        {items.map((r) => (
                          <button
                            key={r.slug}
                            type="button"
                            id={`resort-item-${r.slug}`}
                            onClick={() => {
                              setSelected(r.slug);
                              setSelectedRegion(r.regionId);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all border cursor-pointer ${selected === r.slug
                              ? "bg-white font-semibold text-accent-ice border-2 border-accent-ice ring-1 ring-accent-ice/20 shadow-sm"
                              : "bg-white/60 border-accent-ice/20 hover:bg-white hover:border-accent-ice/45 text-ink shadow-2xs hover:shadow-xs"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-medium leading-tight">{r.name}</span>
                              <span className="font-data text-[11px] font-medium text-ink-faint shrink-0 ml-1.5">
                                ¥{(r.basePrice / 1000).toFixed(1)}k
                              </span>
                            </div>
                            <span className="text-[11px] text-ink-faint mt-0.5 block">{r.region}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </GlassCard>

        {/* ── 中间栏：地图（包含移动端底部详情抽屉与胶囊） ── */}
        <div className="relative h-full w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-white/60 shadow-md sm:shadow-lg">
          <ResortMap
            selectedSlug={selected}
            onSelect={selectResort}
            activeRegion={selectedRegion}
            onRegionSelect={selectRegion}
            names={names}
            regionNames={regionNames}
            backLabel={t("backToOverview")}
            backToRegionLabel={t("backToRegion")}
          />

          {/* ── 移动端专属：雪场详情底部抽屉 (Bottom Sheet) ── */}
          {!isCardDismissed && activeResort ? (
            <div className="lg:hidden absolute bottom-2 inset-x-2 z-30 pointer-events-auto">
              <GlassCard
                strong
                className={clsx(
                  "p-3.5 transition-all duration-300 flex flex-col shadow-2xl border border-white/90 bg-white/95 backdrop-blur-xl rounded-2xl",
                  isMobileExpanded ? "max-h-[320px] overflow-y-auto" : "max-h-[195px] overflow-hidden"
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
                      className="px-2 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-ink-muted text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
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
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-50 text-ink-muted hover:text-red-500 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* 核心数据三列展示 */}
                <div className="grid grid-cols-3 gap-2 py-2 text-[11px] border-b border-sky-100/80">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-ink-muted">{t("statBasePrice")}</span>
                    <span className="font-data font-bold text-accent-ice">¥{activeResort.basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-ink-muted">{t("statCarLabel")}</span>
                    <span className="font-data font-semibold text-ink truncate">
                      {formatCarMin(activeResort.travel.carMin, locale)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-ink-muted">{t("statCourses")}</span>
                    <span className="font-data font-semibold text-ink">{activeResort.courses.total} 条</span>
                  </div>
                </div>

                {/* 展开时显示的更多信息 */}
                {isMobileExpanded && (
                  <div className="py-2 space-y-1.5 text-xs text-ink-muted animate-fadeIn">
                    <p className="text-[11px] leading-relaxed line-clamp-2">{activeResort.summary}</p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-ink-muted">{t("statVertical")}</span>
                      <span className="font-data font-semibold text-ink">{activeResort.elevation.verticalM}m</span>
                    </div>
                    {activeResort.travel.shinkansenMin > 0 && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-ink-muted">{t("statShinkansenLabel")}</span>
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
                    {t("viewDetail")}
                  </Link>
                  <Link
                    href={`/compare?resorts=${compareResortsQuery}`}
                    className="flex-1 py-1.5 rounded-full text-center text-xs font-semibold text-accent-ice border border-accent-ice/30 bg-accent-ice/5 hover:bg-accent-ice hover:text-white transition-colors"
                  >
                    {t("compareResort")}
                  </Link>
                </div>
              </GlassCard>
            </div>
          ) : !isCardDismissed && selectedRegion && regionDetail ? (
            /* ── 移动端专属：大区域详情底部抽屉 (Bottom Sheet) ── */
            <div className="lg:hidden absolute bottom-2 inset-x-2 z-30 pointer-events-auto">
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
                      {t("regionBadge") || "大区域概览"}
                    </span>
                    <h3 className="text-sm font-black text-ink truncate">{regionDetail.title}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsMobileExpanded((v) => !v)}
                      className="px-2 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-ink-muted text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
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
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-50 text-ink-muted hover:text-red-500 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* 核心数据 */}
                <div className="grid grid-cols-3 gap-2 py-2 text-[11px] border-b border-sky-100/80">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-ink-muted">{t("resortCountLabel")}</span>
                    <span className="font-data font-bold text-ink">{resortsInRegion.length} 座</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-ink-muted">{t("carKmRangeLabel")}</span>
                    <span className="font-data font-semibold text-ink truncate">
                      {minCarKm === maxCarKm ? `${minCarKm}km` : `${minCarKm}~${maxCarKm}km`}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-ink-muted">{t("carTimeRangeLabel")}</span>
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

          {/* ── 移动端专属：当详情卡片被 ✕ 关闭时，提供轻巧的「重新展开卡片」小胶囊 ── */}
          {isCardDismissed && (activeResort || (selectedRegion && regionDetail)) ? (
            <div className="lg:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
              <button
                type="button"
                onClick={() => {
                  setIsCardDismissed(false);
                  setIsMobileExpanded(false);
                }}
                className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-accent-ice/40 shadow-lg text-xs font-semibold text-accent-ice flex items-center gap-1.5 hover:bg-white active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>📍 {activeResort ? activeResort.name : regionDetail?.title}</span>
                <span className="text-[10px] text-ink-muted font-normal">· 查看卡片</span>
              </button>
            </div>
          ) : null}
        </div>

        {/* ── 右侧栏：PC 端专属详情面板 (>= lg) ── */}
        <GlassCard className="hidden lg:flex p-4 sm:p-5 overflow-y-auto h-full min-h-0 flex-col" frost={false}>
          {activeResort ? (
            /* ── 雪场详情 ── */
            <>
              <div>
                <span className="text-xs text-ink-faint">{activeResort.region}</span>
                <h2 className="mt-1 text-xl font-black">{activeResort.name}</h2>
              </div>

              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
                {activeResort.summary}
              </p>

              <div className="mt-6 space-y-3">
                <Stat label={t("statBasePrice")} value={`¥${activeResort.basePrice.toLocaleString()}`} />
                <Stat
                  label={t("statShinkansenLabel")}
                  value={
                    activeResort.travel.shinkansenMin > 0
                      ? t("statShinkansenValue", {
                        time: formatShinkansenMin(activeResort.travel.shinkansenMin, locale),
                        price: activeResort.travel.shinkansenYen.toLocaleString(),
                      })
                      : t("noShinkansen")
                  }
                />
                <Stat
                  label={t("statCarLabel")}
                  value={t("statCarValue", {
                    time: formatCarMin(activeResort.travel.carMin, locale),
                    price: activeResort.travel.etcYen.toLocaleString(),
                  })}
                />
                <Stat
                  label={t("statCourses")}
                  value={t("statCoursesValue", {
                    total: activeResort.courses.total,
                    km: activeResort.courses.longestKm,
                  })}
                />
              </div>

              <div className="mt-6 flex flex-col gap-2">
                {/* 第一行：设施标签 */}
                <div className="flex flex-wrap gap-1.5">
                  {activeResort.hasNightSkiing ? (
                    <span className="px-2.5 py-1 rounded-full bg-accent-ice/10 text-[11px] text-accent-ice font-medium">
                      {trp("hasNight")}{activeResort.nightSkiingHours ? ` (${activeResort.nightSkiingHours})` : ""}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-black/5 text-[11px] text-ink-faint font-medium">
                      {trp("noNight")}
                    </span>
                  )}

                  {activeResort.hasPark ? (
                    <span className="px-2.5 py-1 rounded-full bg-accent-ice/10 text-[11px] text-accent-ice font-medium">
                      {trp("hasPark")}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-black/5 text-[11px] text-ink-faint font-medium">
                      {trp("noPark")}
                    </span>
                  )}
                </div>

                {/* 第二行：普通特征标签 */}
                <div className="flex flex-wrap gap-1.5">
                  {activeResort.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-accent-ice/10 text-[11px] text-accent-ice font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6 flex flex-col gap-2.5">
                <Link
                  href={`/resorts/${activeResort.slug}`}
                  className="w-full text-center py-2.5 rounded-full text-sm font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors"
                >
                  {t("viewDetail")}
                </Link>
                <Link
                  href={`/compare?resorts=${compareResortsQuery}`}
                  className="w-full text-center py-2.5 rounded-full text-sm font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors"
                >
                  {t("compareResort")}
                </Link>
              </div>
            </>
          ) : selectedRegion && regionDetail ? (
            /* ── 大区域详情 ── */
            <div className="flex flex-col h-full">
              <div className="pb-3 border-b border-white/60">
                <h2 className="mt-1.5 text-xl font-black">{regionDetail.title}</h2>
              </div>

              <p className="mt-3 text-xs sm:text-[13px] leading-relaxed text-ink-muted">
                {regionDetail.summary}
              </p>

              <div className="mt-4 space-y-2 border-t border-white/60 pt-3 text-xs">
                <Stat label={t("resortCountLabel")} value={`${resortsInRegion.length} 座`} />
                <Stat
                  label={t("carKmRangeLabel")}
                  value={
                    minCarKm === maxCarKm
                      ? `${minCarKm} km`
                      : `${minCarKm} ~ ${maxCarKm} km`
                  }
                />
                <Stat
                  label={t("carTimeRangeLabel")}
                  value={
                    minCarMin === maxCarMin
                      ? formatCarMin(minCarMin, locale)
                      : `${formatCarMin(minCarMin, locale)} ~ ${formatCarMin(maxCarMin, locale)}`
                  }
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">{t("emptyHint")}</p>
          )}
        </GlassCard>
      </div>

      {/* ── 移动端专属：全量雪场分类弹窗 (Resort Picker Modal) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-white flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-ink">{tc("allResorts") || "所有雪场"}</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  共 {resorts.length} 座雪场 · 点击在地图中定位查看
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 text-ink-muted flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Search & Region Groups */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Modal Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder={tc("searchPlaceholder") || "搜索雪场或区域..."}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white border border-sky-200 focus:border-accent-ice focus:outline-none focus:ring-2 focus:ring-accent-ice/30 shadow-2xs font-medium"
                />
                <svg className="w-4 h-4 absolute left-3 top-2.5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Grouped Resorts */}
              {groupedResorts.map(({ regionName, list, regionId }) => {
                const matchingList = list.filter((r) =>
                  modalSearchQuery
                    ? r.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                    r.region.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                    (r.nameJa && r.nameJa.toLowerCase().includes(modalSearchQuery.toLowerCase())) ||
                    r.tags.some((tag) => tag.toLowerCase().includes(modalSearchQuery.toLowerCase()))
                    : true
                );

                if (matchingList.length === 0) return null;

                return (
                  <div key={regionId} className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        selectRegion(regionId);
                        setIsCardDismissed(false);
                        setIsModalOpen(false);
                      }}
                      className="text-xs font-bold text-accent-ice uppercase tracking-wider flex items-center gap-2 hover:underline cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-accent-ice" />
                      {regionName} ({matchingList.length})
                      <span className="text-[10px] text-ink-muted font-normal">· 查看大区</span>
                    </button>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {matchingList.map((r) => {
                        const active = selected === r.slug;
                        return (
                          <button
                            key={r.slug}
                            type="button"
                            onClick={() => {
                              selectResort(r.slug);
                              setIsCardDismissed(false);
                              setIsModalOpen(false);
                            }}
                            className={clsx(
                              "px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between gap-1 cursor-pointer",
                              active
                                ? "bg-accent-ice text-white border-accent-ice shadow-xs"
                                : "bg-gray-50 text-ink border-gray-200/80 hover:bg-accent-ice/10 hover:border-accent-ice/30"
                            )}
                          >
                            <span className="truncate">{r.name}</span>
                            {active && <span className="text-xs font-bold shrink-0">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/60 pb-2.5">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="font-data text-sm font-medium">{value}</span>
    </div>
  );
}

function scrollToItem(container: HTMLElement | null, item: HTMLElement | null) {
  if (!container || !item) return;
  const containerRect = container.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const headerOffset = 52;

  const relativeTop = itemRect.top - containerRect.top;
  const relativeBottom = itemRect.bottom - containerRect.bottom;

  if (relativeTop < headerOffset) {
    container.scrollTo({
      top: container.scrollTop + relativeTop - headerOffset,
      behavior: "smooth",
    });
  } else if (relativeBottom > 0) {
    container.scrollTo({
      top: container.scrollTop + relativeBottom + 12,
      behavior: "smooth",
    });
  }
}