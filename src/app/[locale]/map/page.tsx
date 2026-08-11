"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ResortMap } from "@/components/ResortMap";
import { GlassCard } from "@/components/GlassCard";
import { REGIONS } from "@/lib/regions";
import { useLocalizedResorts } from "@/lib/useLocalizedResorts";
import { formatCarMin, formatShinkansenMin } from "@/lib/utils";

export default function MapPage() {
  const t = useTranslations("map");
  const tr = useTranslations("regions");
  const trd = useTranslations("regionDetails");
  const locale = useLocale();
  const resorts = useLocalizedResorts();
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [collapsedRegions, setCollapsedRegions] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(REGIONS.map((r) => [r.id, true]))
  );
  const [searchQuery, setSearchQuery] = useState("");

  const activeResort = resorts.find((r) => r.slug === selected);
  const compareResortsQuery = activeResort ? activeResort.slug : "";
  const names = Object.fromEntries(resorts.map((r) => [r.slug, r.name]));
  const regionNames = Object.fromEntries(REGIONS.map((r) => [r.id, tr(r.id)]));

  // 当选中的雪场或大区域发生改变时，自动展开对应折叠层并平滑滚动聚焦到左侧列表对应项
  useEffect(() => {
    const targetRegion = selected
      ? resorts.find((res) => res.slug === selected)?.regionId
      : selectedRegion;

    if (targetRegion) {
      setCollapsedRegions((prev) => {
        if (prev[targetRegion]) {
          return { ...prev, [targetRegion]: false };
        }
        return prev;
      });
    }

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
  }, [selected, selectedRegion, resorts]);

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

  const resortsInRegion = useMemo(
    () => (selectedRegion ? resorts.filter((r) => r.regionId === selectedRegion) : []),
    [selectedRegion, resorts]
  );

  const minPrice = resortsInRegion.length ? Math.min(...resortsInRegion.map((r) => r.basePrice)) : 0;
  const maxPrice = resortsInRegion.length ? Math.max(...resortsInRegion.map((r) => r.basePrice)) : 0;

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
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_260px] xl:grid-cols-[260px_1fr_300px] gap-3.5 sm:gap-4 h-full min-h-0">
        {/* 雪场列表，按大区域分组 */}
        <GlassCard className="p-0 h-full min-h-0 flex flex-col overflow-hidden" frost={false}>
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
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 text-ink-faint hover:text-ink p-0.5 rounded-full transition-colors"
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
                      {/* 遮罩下方渐变区域：让向上滚动的雪场列表产生柔和优雅的渐隐过渡 */}
                      <div className="absolute -left-2.5 -right-2.5 sm:-left-3 sm:-right-3 top-full h-3.5 bg-gradient-to-b from-white/95 via-white/40 to-transparent pointer-events-none -z-10" />
                      <button
                        onClick={() => toggleRegion(region.id)}
                        className={`w-full text-left px-3.5 py-2.5 text-[11px] font-bold tracking-wide uppercase flex items-center justify-between rounded-xl backdrop-blur-md transition-all border-2 ${selectedRegion === region.id
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
                            id={`resort-item-${r.slug}`}
                            onClick={() => {
                              setSelected(r.slug);
                              setSelectedRegion(r.regionId);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all border ${selected === r.slug
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

        {/* 地图 */}
        <div className="relative h-full w-full">
          <ResortMap
            selectedSlug={selected}
            onSelect={(slug) => {
              setSelected(slug);
              if (slug) {
                const r = resorts.find((res) => res.slug === slug);
                if (r) setSelectedRegion(r.regionId);
              }
            }}
            activeRegion={selectedRegion}
            onRegionSelect={(regId) => {
              setSelectedRegion(regId);
              if (!regId) setSelected(null);
            }}
            names={names}
            regionNames={regionNames}
            backLabel={t("backToOverview")}
            backToRegionLabel={t("backToRegion")}
          />
        </div>

        {/* 详情面板 */}
        <GlassCard className="p-4 sm:p-5 overflow-y-auto h-full min-h-0 flex flex-col" frost={false}>
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
                  label={t("statTravel")}
                  value={
                    activeResort.travel.shinkansenMin
                      ? formatShinkansenMin(activeResort.travel.shinkansenMin, locale)
                      : formatCarMin(activeResort.travel.carMin, locale)
                  }
                />
                <Stat
                  label={t("statCourses")}
                  value={t("statCoursesValue", {
                    total: activeResort.courses.total,
                    km: activeResort.courses.longestKm,
                  })}
                />
                <Stat label={t("statVertical")} value={`${activeResort.elevation.verticalM}m`} />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {activeResort.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-full bg-accent-ice/10 text-[11px] text-accent-ice font-medium"
                  >
                    {tag}
                  </span>
                ))}
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
                <Stat label={t("travelLabel")} value={regionDetail.travelInfo} />
                <Stat
                  label={t("priceRangeLabel")}
                  value={
                    minPrice === maxPrice
                      ? `¥${minPrice.toLocaleString()}`
                      : `¥${minPrice.toLocaleString()} ~ ¥${maxPrice.toLocaleString()}`
                  }
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-ink-muted">{t("emptyHint")}</p>
          )}
        </GlassCard>
      </div>
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
  // 顶部 sticky header 高度 + 遮罩层偏移量 (约 52px)，避免滚动后顶部被粘性标题挡住
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