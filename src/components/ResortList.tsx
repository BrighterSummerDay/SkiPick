"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/GlassCard";
import { REGIONS } from "@/lib/regions";
import type { LocalizedResort } from "@/lib/getLocalizedResorts";

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
                className={`w-full text-left px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
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

  const isFiltered =
    selectedRegion !== "all" || priceSort !== "default" || filterNight || filterPark || filterGondola;

  const handleReset = () => {
    setSelectedRegion("all");
    setPriceSort("default");
    setFilterNight(false);
    setFilterPark(false);
    setFilterGondola(false);
  };

  const filteredResorts = useMemo(() => {
    let list = [...resorts];
    if (selectedRegion !== "all") list = list.filter((r) => r.regionId === selectedRegion);
    if (filterNight) list = list.filter((r) => r.hasNightSkiing);
    if (filterPark) list = list.filter((r) => r.hasPark);
    if (filterGondola) list = list.filter((r) => r.lifts && r.lifts.gondola > 0);
    if (priceSort === "price-asc") list.sort((a, b) => a.basePrice - b.basePrice);
    else if (priceSort === "price-desc") list.sort((a, b) => b.basePrice - a.basePrice);
    return list;
  }, [resorts, selectedRegion, filterNight, filterPark, filterGondola, priceSort]);

  return (
    // flex-1 min-h-0 → 在 flex 链中撑满父容器剩余高度（比 h-full 更可靠）
    // 筛选面板 shrink-0 → 高度固定不动
    // 卡片区 flex-1 overflow-y-auto → 只有这块独立滚动
    <div className="flex-1 flex flex-col min-h-0 font-sans">

      {/* ── 筛选面板（固定，不滚动） ─────────────────────── */}
      <GlassCard className="shrink-0 z-30 p-4 sm:p-6 w-full border border-white/60 shadow-lg bg-[#eaf3fc]/95 backdrop-blur-xl space-y-4">
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
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              filterNight
                ? "bg-accent-ice text-white border-accent-ice shadow-sm"
                : "bg-white/5 text-ink-muted border-accent-ice/20 hover:border-accent-ice/50 hover:text-ink"
            }`}
          >
            {t("hasNight")}
          </button>

          <button
            type="button"
            onClick={() => setFilterPark((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              filterPark
                ? "bg-accent-ice text-white border-accent-ice shadow-sm"
                : "bg-white/5 text-ink-muted border-accent-ice/20 hover:border-accent-ice/50 hover:text-ink"
            }`}
          >
            {t("hasPark")}
          </button>

          <button
            type="button"
            onClick={() => setFilterGondola((prev) => !prev)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
              filterGondola
                ? "bg-accent-ice text-white border-accent-ice shadow-sm"
                : "bg-white/5 text-ink-muted border-accent-ice/20 hover:border-accent-ice/50 hover:text-ink"
            }`}
          >
            {t("hasGondola")}
          </button>
        </div>
      </GlassCard>

      {/* ── 雪场卡片区（独立滚动） ────────────────────────── */}
      <div className="flex-1 overflow-y-auto mt-4 pb-8">
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
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {filteredResorts.map((resort) => (
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

                    {resort.lifts && resort.lifts.gondola > 0 ? (
                      <span className="px-3 py-1 rounded-full bg-accent-ice/10 text-[11px] text-accent-ice font-medium">
                        {t("hasGondola")}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-black/5 text-[11px] text-ink-faint font-medium">
                        {t("noGondola")}
                      </span>
                    )}
                  </div>

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
        )}
      </div>
    </div>
  );
}
