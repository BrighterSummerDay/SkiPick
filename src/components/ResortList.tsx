"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/GlassCard";
import { REGIONS } from "@/lib/regions";
import type { LocalizedResort } from "@/lib/getLocalizedResorts";
import clsx from "clsx";

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (val: string) => void;
}

function CustomSelect({ value, options, onChange }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left select-none transition-all ${open ? "z-50" : "z-10"}`}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-between gap-3 px-4 py-2 rounded-full bg-white/80 hover:bg-white border border-accent-ice/30 text-xs sm:text-sm font-sans font-medium text-ink-main focus:outline-none focus:border-accent-ice focus:ring-2 focus:ring-accent-ice/20 cursor-pointer transition-all shadow-sm"
      >
        <span>{selectedOption?.label}</span>
        <svg
          className={`w-4 h-4 text-accent-ice transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 min-w-full w-max max-w-[260px] rounded-2xl bg-white/95 backdrop-blur-md border border-accent-ice/30 shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                  ? "bg-accent-ice/15 text-accent-ice font-semibold"
                  : "text-slate-700 hover:bg-accent-ice/10 hover:text-accent-ice"
                  }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 text-accent-ice shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ResortList({ resorts }: { resorts: LocalizedResort[] }) {
  const t = useTranslations("resortsPage");
  const tRegions = useTranslations("regions");

  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [priceSort, setPriceSort] = useState<"default" | "price-asc" | "price-desc">("default");
  const [filterNight, setFilterNight] = useState<boolean>(false);
  const [filterPark, setFilterPark] = useState<boolean>(false);
  const [filterGondola, setFilterGondola] = useState<boolean>(false);
  const [mobileSearch, setMobileSearch] = useState<string>("");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

  const regionOptions: CustomSelectOption[] = useMemo(
    () => [
      { value: "all", label: t("allRegions") },
      ...REGIONS.map((r) => ({ value: r.id, label: tRegions(r.id) })),
    ],
    [t, tRegions]
  );

  const priceSortOptions: CustomSelectOption[] = useMemo(
    () => [
      { value: "default", label: t("sortDefault") },
      { value: "price-asc", label: t("sortPriceAsc") },
      { value: "price-desc", label: t("sortPriceDesc") },
    ],
    [t]
  );

  const drawerFilterCount =
    (selectedRegion !== "all" ? 1 : 0) +
    (priceSort !== "default" ? 1 : 0) +
    (filterNight ? 1 : 0) +
    (filterPark ? 1 : 0) +
    (filterGondola ? 1 : 0);

  const isFiltered =
    drawerFilterCount > 0 || mobileSearch.trim().length > 0;

  const handleReset = () => {
    setSelectedRegion("all");
    setPriceSort("default");
    setFilterNight(false);
    setFilterPark(false);
    setFilterGondola(false);
    setMobileSearch("");
  };

  const filteredResorts = useMemo(() => {
    let list = [...resorts];
    if (mobileSearch.trim()) {
      const q = mobileSearch.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.region.toLowerCase().includes(q) ||
          (r.nameJa && r.nameJa.toLowerCase().includes(q)) ||
          r.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    if (selectedRegion !== "all") list = list.filter((r) => r.regionId === selectedRegion);
    if (filterNight) list = list.filter((r) => r.hasNightSkiing);
    if (filterPark) list = list.filter((r) => r.hasPark);
    if (filterGondola) list = list.filter((r) => r.lifts && r.lifts.gondola > 0);
    if (priceSort === "price-asc") list.sort((a, b) => a.basePrice - b.basePrice);
    else if (priceSort === "price-desc") list.sort((a, b) => b.basePrice - a.basePrice);
    return list;
  }, [resorts, mobileSearch, selectedRegion, filterNight, filterPark, filterGondola, priceSort]);

  return (
    <div className="flex-1 flex flex-col min-h-0 font-sans">
      {/* ── 移动端专属 (< sm)：筛选按钮 + 搜索栏 + 数量统计 ── */}
      <GlassCard
        className="sm:hidden shrink-0 z-20 px-3 py-2 w-full border border-white/80 shadow-xs bg-[#eaf3fc]/95 backdrop-blur-xl flex items-center gap-2"
        frost={false}
      >
        {/* 筛选按钮（点击展开底部筛选抽屉） */}
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className={clsx(
            "px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs border shrink-0 cursor-pointer active:scale-95",
            drawerFilterCount > 0
              ? "bg-accent-ice text-white border-accent-ice shadow-xs"
              : "bg-white/85 text-ink border-sky-200/80 hover:bg-white"
          )}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>{t("filterTitle") || "筛选"}</span>
          {drawerFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-accent-ice text-[10px] font-black flex items-center justify-center">
              {drawerFilterCount}
            </span>
          )}
        </button>

        {/* 实时搜索栏 */}
        <div className="relative flex-1 min-w-0">
          <svg className="w-3.5 h-3.5 absolute left-2.5 top-2 text-ink-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={mobileSearch}
            onChange={(e) => setMobileSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-7 pr-6 py-1.5 rounded-full text-xs bg-white/90 border border-sky-300/80 focus:bg-white focus:border-accent-ice focus:ring-2 focus:ring-accent-ice/30 text-ink shadow-2xs font-medium placeholder:text-ink-muted/70 truncate"
          />
          {mobileSearch && (
            <button
              type="button"
              onClick={() => setMobileSearch("")}
              className="absolute right-2 top-1.5 text-ink-muted hover:text-ink text-xs p-0.5 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* 数量统计与重置 */}
        <div className="flex items-center gap-1.5 shrink-0 text-xs">
          <span className="font-data font-bold text-ink-muted bg-white/70 px-2 py-1 rounded-lg border border-sky-200/60 whitespace-nowrap">
            {filteredResorts.length}座
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-accent-ice hover:underline font-medium cursor-pointer whitespace-nowrap"
            >
              {t("resetFilters")}
            </button>
          )}
        </div>
      </GlassCard>

      {/* ── 桌面端专属 (>= sm)：原始完整筛选面板 ── */}
      <GlassCard className="hidden sm:block shrink-0 z-30 p-4 sm:p-6 w-full border border-white/60 shadow-lg bg-[#eaf3fc]/95 backdrop-blur-xl space-y-4">
        {/* 第一行：区域下拉 + 价格排序 + 统计与重置 */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap">
                {t("regionLabel")}
              </label>
              <CustomSelect
                value={selectedRegion}
                options={regionOptions}
                onChange={(val) => setSelectedRegion(val)}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap">
                {t("priceSortLabel")}
              </label>
              <CustomSelect
                value={priceSort}
                options={priceSortOptions}
                onChange={(val) => setPriceSort(val as "default" | "price-asc" | "price-desc")}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-ink-faint font-data">
              {t("showingCount", { count: filteredResorts.length })}
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-accent-ice hover:underline font-medium cursor-pointer transition-all"
              >
                {t("resetFilters")}
              </button>
            )}
          </div>
        </div>

        {/* 第二行：设施 Toggle 筛选条件 */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-white/10">
          <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider whitespace-nowrap mr-1">
            {t("filterConditions")}
          </span>

          <button
            type="button"
            onClick={() => setFilterNight((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${filterNight
              ? "bg-accent-ice text-white border-accent-ice shadow-sm"
              : "bg-white/5 text-ink-muted border-accent-ice/20 hover:border-accent-ice/50 hover:text-ink"
              }`}
          >
            {t("hasNight")}
          </button>

          <button
            type="button"
            onClick={() => setFilterPark((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${filterPark
              ? "bg-accent-ice text-white border-accent-ice shadow-sm"
              : "bg-white/5 text-ink-muted border-accent-ice/20 hover:border-accent-ice/50 hover:text-ink"
              }`}
          >
            {t("hasPark")}
          </button>

          <button
            type="button"
            onClick={() => setFilterGondola((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${filterGondola
              ? "bg-accent-ice text-white border-accent-ice shadow-sm"
              : "bg-white/5 text-ink-muted border-accent-ice/20 hover:border-accent-ice/50 hover:text-ink"
              }`}
          >
            {t("hasGondola")}
          </button>
        </div>
      </GlassCard>

      {/* ── 移动端专属：底部筛选抽屉 (Bottom Sheet Drawer) ── */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-xs animate-fadeIn sm:hidden">
          <div className="fixed inset-0" onClick={() => setIsMobileDrawerOpen(false)} />
          <div className="relative w-full max-h-[85vh] bg-white/98 backdrop-blur-2xl rounded-t-3xl shadow-2xl border-t border-white flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* 抽屉头部 */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-ink">{t("filterTitle")}</h3>
                {drawerFilterCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-accent-ice text-white text-[10px] font-bold">
                    {t("selectedFilterCount", { count: drawerFilterCount })}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-200/70 hover:bg-gray-200 text-ink-muted flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 抽屉主体内容 */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* 大区域选择 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
                  {t("regionLabel")}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {regionOptions.map((opt) => {
                    const isSelected = selectedRegion === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSelectedRegion(opt.value)}
                        className={clsx(
                          "px-2.5 py-1.5 rounded-xl text-xs font-semibold text-center transition-all border truncate cursor-pointer",
                          isSelected
                            ? "bg-accent-ice text-white border-accent-ice shadow-xs"
                            : "bg-slate-50 text-slate-700 border-gray-200/80 hover:bg-accent-ice/10"
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 价格排序 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
                  {t("priceSortLabel")}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {priceSortOptions.map((opt) => {
                    const isSelected = priceSort === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPriceSort(opt.value as typeof priceSort)}
                        className={clsx(
                          "px-2 py-1.5 rounded-xl text-xs font-semibold text-center transition-all border truncate cursor-pointer",
                          isSelected
                            ? "bg-accent-ice text-white border-accent-ice shadow-xs"
                            : "bg-slate-50 text-slate-700 border-gray-200/80 hover:bg-accent-ice/10"
                        )}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 特色设施多选 */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink-muted uppercase tracking-wider block">
                  {t("filterConditions")}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilterNight((v) => !v)}
                    className={clsx(
                      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer",
                      filterNight
                        ? "bg-accent-ice text-white border-accent-ice shadow-xs"
                        : "bg-slate-50 text-slate-700 border-gray-200 hover:bg-accent-ice/10"
                    )}
                  >
                    <span>{t("hasNight")}</span>
                    {filterNight && <span>✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterPark((v) => !v)}
                    className={clsx(
                      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer",
                      filterPark
                        ? "bg-accent-ice text-white border-accent-ice shadow-xs"
                        : "bg-slate-50 text-slate-700 border-gray-200 hover:bg-accent-ice/10"
                    )}
                  >
                    <span>{t("hasPark")}</span>
                    {filterPark && <span>✓</span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterGondola((v) => !v)}
                    className={clsx(
                      "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer",
                      filterGondola
                        ? "bg-accent-ice text-white border-accent-ice shadow-xs"
                        : "bg-slate-50 text-slate-700 border-gray-200 hover:bg-accent-ice/10"
                    )}
                  >
                    <span>{t("hasGondola")}</span>
                    {filterGondola && <span>✓</span>}
                  </button>
                </div>
              </div>
            </div>

            {/* 抽屉底部确定/重置 */}
            <div className="px-5 py-3 bg-slate-50/90 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-ink-muted hover:text-red-500 underline font-medium transition-colors cursor-pointer"
              >
                {t("resetFilters")}
              </button>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 py-2.5 rounded-full bg-accent-ice hover:bg-accent-ice/90 text-white font-bold text-xs transition-all shadow-md active:scale-95 text-center cursor-pointer"
              >
                {t("viewResortsBtn", { count: filteredResorts.length })}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 雪场卡片区（独立滚动） ────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden mt-2.5 sm:mt-4 pb-8 px-0.5 sm:px-1 w-full min-w-0">
        {filteredResorts.length === 0 ? (
          <GlassCard className="p-8 text-center text-ink-muted text-sm space-y-4">
            <p>{t("emptyFiltered")}</p>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors cursor-pointer"
            >
              {t("resetFilters")}
            </button>
          </GlassCard>
        ) : (
          <div className="grid gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch w-full min-w-0">
            {filteredResorts.map((resort) => (
              <GlassCard key={resort.slug} className="p-3.5 sm:p-6 flex h-full flex-col w-full min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] text-ink-faint">{resort.region}</span>
                      <h2 className="mt-0.5 sm:mt-2 text-base sm:text-xl font-black tracking-tight truncate">{resort.name}</h2>
                      <p className="mt-1.5 sm:mt-3 text-xs sm:text-sm leading-relaxed text-ink-muted line-clamp-2">
                        {resort.summary}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[10px] sm:text-xs text-ink-faint block">{t("priceLabel")}</span>
                      <div className="mt-0.5 sm:mt-1 text-base sm:text-xl font-bold font-data text-accent-ice">
                        ¥{resort.basePrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 sm:mt-6 flex flex-col gap-2 min-w-0">
                  <div className="flex flex-wrap gap-1.5 min-w-0">
                    {resort.hasNightSkiing ? (
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-accent-ice/10 text-[10.5px] sm:text-[11px] text-accent-ice font-medium max-w-full break-words">
                        {t("hasNight")}{resort.nightSkiingHours ? ` (${resort.nightSkiingHours})` : ""}
                      </span>
                    ) : (
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/5 text-[10.5px] sm:text-[11px] text-ink-faint font-medium">
                        {t("noNight")}
                      </span>
                    )}

                    {resort.hasPark ? (
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-accent-ice/10 text-[10.5px] sm:text-[11px] text-accent-ice font-medium">
                        {t("hasPark")}
                      </span>
                    ) : (
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/5 text-[10.5px] sm:text-[11px] text-ink-faint font-medium">
                        {t("noPark")}
                      </span>
                    )}

                    {resort.lifts && resort.lifts.gondola > 0 ? (
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-accent-ice/10 text-[10.5px] sm:text-[11px] text-accent-ice font-medium">
                        {t("hasGondola")}
                      </span>
                    ) : (
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/5 text-[10.5px] sm:text-[11px] text-ink-faint font-medium">
                        {t("noGondola")}
                      </span>
                    )}

                    {resort.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-accent-ice/10 text-[10.5px] sm:text-[11px] text-accent-ice font-medium max-w-full break-words"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/resorts/${resort.slug}`}
                    className="mt-1 sm:mt-auto inline-flex items-center justify-center w-full rounded-full px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-accent-ice border border-accent-ice/30 bg-accent-ice/5 hover:bg-accent-ice hover:text-white transition-colors"
                  >
                    {t("viewDetail")}
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
