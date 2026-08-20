"use client";

import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { GlassCard } from "@/components/GlassCard";
import { DifficultyLegend } from "@/components/DifficultyMark";
import { useLocalizedResorts } from "@/lib/useLocalizedResorts";
import { REGIONS } from "@/lib/regions";
import {
  ALL_METRICS,
  DEFAULT_METRIC_IDS,
  type MetricId,
  type TFunction,
} from "@/lib/compareMetrics";
import clsx from "clsx";

const MAX_SELECT = 4;

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-8 mb-12">
          <p className="text-sm text-ink-muted">Loading compare page...</p>
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}

function ComparePageContent() {
  const t = useTranslations("compare");
  const td = useTranslations("difficulty");
  const tr = useTranslations("regions");
  const locale = useLocale();
  const resorts = useLocalizedResorts();
  const searchParams = useSearchParams();

  // ── 雪场选择与模态框状态 ───────────────────────
  const [selectedResorts, setSelectedResorts] = useState<string[]>(() =>
    getInitialSelectedResorts(resorts, searchParams)
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSelectedDropdownOpen, setIsSelectedDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  function toggleResort(slug: string) {
    setSelectedResorts((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_SELECT) return prev;
      return [...prev, slug];
    });
  }

  // ── 纵向：选择对比项 ────────────────────────────
  const [selectedMetrics, setSelectedMetrics] =
    useState<MetricId[]>(DEFAULT_METRIC_IDS);

  function toggleMetric(id: MetricId) {
    setSelectedMetrics((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  const isAllMetricsSelected = selectedMetrics.length === ALL_METRICS.length;

  function toggleAllMetrics() {
    if (isAllMetricsSelected) {
      setSelectedMetrics([]);
    } else {
      setSelectedMetrics(ALL_METRICS.map((m) => m.id));
    }
  }

  // ── 派生与搜索逻辑 ─────────────────────────────────
  const activeResorts = resorts.filter((r) => selectedResorts.includes(r.slug));
  const activeMetrics = ALL_METRICS.filter((m) =>
    selectedMetrics.includes(m.id)
  );

  const filteredResorts = useMemo(() => {
    if (!searchQuery.trim()) return resorts;
    const q = searchQuery.toLowerCase().trim();
    return resorts.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        (r.nameJa && r.nameJa.toLowerCase().includes(q)) ||
        r.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [resorts, searchQuery]);

  // 保持与雪场地图 (Map Page) 完全相同的区域分类与排列顺序
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

  const tAsMetricFn = t as unknown as TFunction;

  return (
    <div
      id="compare-page-container"
      className="mx-4 sm:mx-8 h-[calc(100vh-var(--header-offset)-44px)] pb-1 flex flex-col overflow-hidden"
    >
      {/* ── 顶部控制栏 (Responsive Control Bar) ── */}
      <GlassCard
        className="px-3 py-2 mb-2 shrink-0 flex items-center justify-between gap-2 z-30 relative border border-white/80 shadow-xs"
        frost={false}
      >
        {/* 左侧区域：【所有雪场】+ PC端【实时搜索框】 */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* 所有雪场 Modal 触发按钮 */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3 sm:px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-white text-accent-ice border border-accent-ice/35 hover:border-accent-ice font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
          >
            <span>{t("allResorts")} ({resorts.length})</span>
            <svg className="w-3.5 h-3.5 text-accent-ice" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* PC 端专属 (>= lg)：实时搜索框 */}
          <div className="hidden lg:block relative w-[210px]">
            <div className="relative flex items-center">
              <svg className="w-3.5 h-3.5 absolute left-2.5 text-ink-muted/80 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-8 pr-7 py-1.5 rounded-full text-xs bg-white/90 border border-sky-300/80 focus:bg-white focus:border-accent-ice focus:ring-2 focus:ring-accent-ice/30 text-ink shadow-xs transition-all placeholder:text-ink-muted/70 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 text-ink-muted hover:text-ink text-xs p-0.5 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* 搜索下拉弹窗 */}
            {isSearchOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsSearchOpen(false)} />
                <div className="absolute left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-sky-100/90 z-40 py-1 text-xs">
                  {filteredResorts.length === 0 ? (
                    <div className="px-4 py-3 text-ink-muted text-center">{t("noSearchResult")}</div>
                  ) : (
                    filteredResorts.map((r) => {
                      const isSelected = selectedResorts.includes(r.slug);
                      const disabled = !isSelected && selectedResorts.length >= MAX_SELECT;
                      return (
                        <button
                          key={r.slug}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            toggleResort(r.slug);
                            setSearchQuery("");
                            setIsSearchOpen(false);
                          }}
                          className={clsx(
                            "w-full px-3.5 py-2 flex items-center justify-between text-left transition-colors cursor-pointer",
                            isSelected
                              ? "bg-accent-ice/15 text-accent-ice font-semibold"
                              : "hover:bg-accent-ice/10 text-ink",
                            disabled && "opacity-40 cursor-not-allowed"
                          )}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold">{r.name}</span>
                            <span className="text-[10px] text-ink-muted">{r.region}</span>
                          </div>
                          {isSelected && (
                            <span className="text-accent-ice font-bold text-sm">✓</span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* PC 端专属 (>= lg)：中间平铺已选雪场 Chips */}
        {activeResorts.length > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 flex-wrap flex-1 min-w-0 px-2">
            {activeResorts.map((r) => (
              <span
                key={r.slug}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-ice/15 text-accent-ice border border-accent-ice/30 shadow-2xs transition-all shrink-0"
              >
                <span>{r.name}</span>
                <button
                  type="button"
                  onClick={() => toggleResort(r.slug)}
                  className="w-4 h-4 rounded-full bg-accent-ice/20 hover:bg-accent-ice/40 text-accent-ice flex items-center justify-center text-[10px] leading-none transition-colors cursor-pointer"
                  title="Remove"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* PC 端专属 (>= lg)：最右侧已选计数与清空 */}
        <div className="hidden lg:flex items-center gap-2 shrink-0 text-xs">
          <span className="text-ink font-semibold bg-white/80 px-2.5 py-1 rounded-lg border border-sky-200/80 shadow-2xs whitespace-nowrap">
            {t("selectedCount", { count: selectedResorts.length, max: MAX_SELECT })}
          </span>
          {selectedResorts.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedResorts([])}
              className="text-ink-muted hover:text-red-500 transition-colors px-1 py-0.5 text-xs underline cursor-pointer whitespace-nowrap"
            >
              {t("clearAll")}
            </button>
          )}
        </div>

        {/* ── 移动端专属 (< lg)：右侧【已选 2/4 ▾】按钮 + 【清空已选】 ── */}
        <div className="flex lg:hidden relative items-center gap-1.5 sm:gap-2 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setIsSelectedDropdownOpen((v) => !v)}
            className={clsx(
              "px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs border text-xs",
              selectedResorts.length > 0
                ? "bg-accent-ice/15 text-accent-ice border-accent-ice/35 hover:bg-accent-ice/25"
                : "bg-white/80 text-ink-muted border-sky-200/70 hover:bg-white"
            )}
          >
            <span>{t("selectedCount", { count: selectedResorts.length, max: MAX_SELECT })}</span>
            <svg
              className={clsx(
                "w-3.5 h-3.5 transition-transform duration-200",
                isSelectedDropdownOpen ? "rotate-180 text-accent-ice" : "text-ink-muted"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 移动端已选雪场下拉弹出菜单 */}
          {isSelectedDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsSelectedDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-[270px] sm:w-[290px] bg-white/98 backdrop-blur-xl border border-sky-100/90 shadow-2xl rounded-2xl p-2.5 z-40 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-2 pb-2 mb-1 border-b border-gray-100">
                  <span className="font-bold text-xs text-ink">
                    {t("selectedCount", { count: selectedResorts.length, max: MAX_SELECT })}
                  </span>
                  {selectedResorts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedResorts([])}
                      className="text-[11px] text-ink-muted hover:text-red-500 transition-colors underline cursor-pointer"
                    >
                      {t("clearAll")}
                    </button>
                  )}
                </div>

                {activeResorts.length === 0 ? (
                  <div className="py-4 text-center text-xs text-ink-muted">
                    {t("emptyHint")}
                  </div>
                ) : (
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {activeResorts.map((r) => (
                      <div
                        key={r.slug}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-50/80 hover:bg-red-50/60 transition-colors group"
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-semibold text-xs text-ink truncate">{r.name}</span>
                          <span className="text-[10px] text-ink-muted">{r.region}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleResort(r.slug)}
                          className="w-5 h-5 rounded-full bg-gray-200/70 group-hover:bg-red-500 group-hover:text-white text-ink-muted flex items-center justify-center text-[10px] transition-colors shrink-0 cursor-pointer"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </GlassCard>

      {/* ── 第二行：指标筛选条 (Metric Selector) ── */}
      <GlassCard className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 mb-2.5 shrink-0 border border-white/80 shadow-2xs" frost={false}>
        {/* PC 端专属 (>= lg)：完整带标头布局 */}
        <div className="hidden lg:flex items-center gap-3 overflow-x-auto py-0.5">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              {t("metricSectionTitle")}:
            </span>
            <button
              onClick={toggleAllMetrics}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1 active:scale-95 cursor-pointer",
                isAllMetricsSelected
                  ? "bg-accent-ice text-white hover:bg-accent-ice/90"
                  : "bg-white/80 hover:bg-white text-accent-ice border border-accent-ice/40"
              )}
            >
              <span>{isAllMetricsSelected ? t("deselectAll") : t("selectAll")}</span>
            </button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {ALL_METRICS.map((metric) => {
              const active = selectedMetrics.includes(metric.id);
              return (
                <button
                  key={metric.id}
                  onClick={() => toggleMetric(metric.id)}
                  className={clsx(
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-all border shrink-0 cursor-pointer",
                    active
                      ? "bg-accent-ice/15 text-accent-ice border-accent-ice/40 font-semibold shadow-2xs"
                      : "bg-white/50 text-ink-muted border-transparent hover:bg-white/80 hover:text-ink"
                  )}
                >
                  {t(metric.labelKey as Parameters<typeof t>[0])}
                </button>
              );
            })}
          </div>
        </div>

        {/* 移动端专属 (< lg)：单行横滑指标条 */}
        <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {/* 第 1 个特殊胶囊：全选 / 全不选 */}
          <button
            type="button"
            onClick={toggleAllMetrics}
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1 active:scale-95 whitespace-nowrap cursor-pointer",
              isAllMetricsSelected
                ? "bg-accent-ice text-white hover:bg-accent-ice/90"
                : "bg-white/80 hover:bg-white text-accent-ice border border-accent-ice/40"
            )}
          >
            <span>{isAllMetricsSelected ? t("deselectAll") : t("selectAll")}</span>
          </button>

          {/* 后续各个对比指标按钮 */}
          {ALL_METRICS.map((metric) => {
            const active = selectedMetrics.includes(metric.id);
            return (
              <button
                key={metric.id}
                type="button"
                onClick={() => toggleMetric(metric.id)}
                className={clsx(
                  "px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium transition-all border shrink-0 whitespace-nowrap cursor-pointer",
                  active
                    ? "bg-accent-ice/15 text-accent-ice border-accent-ice/40 font-semibold shadow-2xs"
                    : "bg-white/50 text-ink-muted border-transparent hover:bg-white/80 hover:text-ink"
                )}
              >
                {t(metric.labelKey as Parameters<typeof t>[0])}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* ── 对比卡片区 ────────────────────────────── */}
      {activeResorts.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-sm text-ink-muted bg-white/40 px-6 py-4 rounded-2xl border border-white/60">{t("emptyHint")}</p>
        </div>
      ) : activeMetrics.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-sm text-ink-muted bg-white/40 px-6 py-4 rounded-2xl border border-white/60">{t("emptyMetrics")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1 pb-4 px-0.5 sm:px-1">
          <div
            className="grid gap-3.5 sm:gap-5 w-max min-w-full justify-start items-stretch"
            style={{
              gridTemplateColumns: `repeat(${activeResorts.length}, minmax(250px, ${
                activeResorts.length === 1 ? "420px" : "1fr"
              }))`,
            }}
          >
            {activeResorts.map((r) => (
              <GlassCard key={r.slug} className="p-4 sm:p-6 flex flex-col min-w-0">
                {/* ── 雪场名称 ── */}
                <span className="text-xs text-ink-faint">{r.region}</span>
                <h3 className="mt-1 text-lg font-black">{r.name}</h3>

                {/* ── 动态渲染选中的对比项 ── */}
                <div className="mt-4 flex flex-col">
                  {activeMetrics.map((metric) =>
                    metric.isBlock ? (
                      /* 难度条等大块项：不走标准行包裹 */
                      <div key={metric.id} className="py-2.5 border-t border-white/60">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-ink-muted block">
                              {t(metric.labelKey as Parameters<typeof t>[0])}
                            </span>
                            {metric.id === "difficultyBar" ? (
                              <div className="flex items-center gap-2 text-[10px] text-ink-muted">
                                <DifficultyLegend
                                  labels={{
                                    beginner: td("beginner"),
                                    intermediate: td("intermediate"),
                                    advanced: td("advanced"),
                                  }}
                                />
                              </div>
                            ) : null}
                          </div>
                          {metric.renderCell(r, tAsMetricFn, locale)}
                        </div>
                      </div>
                    ) : (
                      /* 普通行 */
                      <Row
                        key={metric.id}
                        label={t(metric.labelKey as Parameters<typeof t>[0])}
                      >
                        {metric.renderCell(r, tAsMetricFn, locale)}
                      </Row>
                    )
                  )}
                </div>

                {/* ── Tags ── */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {r.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-white/60 text-[10.5px] text-ink-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* ── 全量雪场分类弹窗 (Resort Picker Modal) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl border border-white flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-ink">{t("modalTitle")}</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  {t("maxSelectedTip", { max: MAX_SELECT })} · {t("selectedCount", { count: selectedResorts.length, max: MAX_SELECT })}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200/60 hover:bg-gray-200 text-ink-muted flex items-center justify-center text-sm transition-colors"
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
                  placeholder={t("searchPlaceholder")}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white border border-sky-200 focus:border-accent-ice focus:outline-none focus:ring-2 focus:ring-accent-ice/30 shadow-2xs font-medium"
                />
                <svg className="w-4 h-4 absolute left-3 top-2.5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Grouped Resorts (保持与雪场地图一致的区域顺序与分类) */}
              {groupedResorts.map(({ regionName, list }) => {
                const matchingList = list.filter((r) =>
                  modalSearchQuery
                    ? r.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                    r.region.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                    (r.nameJa && r.nameJa.toLowerCase().includes(modalSearchQuery.toLowerCase())) ||
                    r.tags.some((t) => t.toLowerCase().includes(modalSearchQuery.toLowerCase()))
                    : true
                );

                if (matchingList.length === 0) return null;

                return (
                  <div key={regionName} className="space-y-2.5">
                    <h4 className="text-xs font-bold text-accent-ice uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-accent-ice" />
                      {regionName} ({matchingList.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {matchingList.map((r) => {
                        const active = selectedResorts.includes(r.slug);
                        const disabled = !active && selectedResorts.length >= MAX_SELECT;
                        return (
                          <button
                            key={r.slug}
                            onClick={() => toggleResort(r.slug)}
                            disabled={disabled}
                            className={clsx(
                              "px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border flex items-center justify-between gap-1",
                              active
                                ? "bg-accent-ice text-white border-accent-ice shadow-xs"
                                : "bg-gray-50 text-ink border-gray-200/80 hover:bg-accent-ice/10 hover:border-accent-ice/30",
                              disabled && "opacity-40 cursor-not-allowed"
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

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between shrink-0">
              <button
                onClick={() => setSelectedResorts([])}
                className="text-xs text-ink-muted hover:text-red-500 transition-colors underline"
              >
                {t("clearAll")}
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-full bg-accent-ice hover:bg-accent-ice/90 text-white font-bold text-xs transition-all shadow-md active:scale-95"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 通用行组件 ─────────────────────────────────────
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2.5 border-t border-white/60 flex items-center justify-between gap-3">
      <span className="text-xs text-ink-muted shrink-0">{label}</span>
      <span className="font-data text-[12.5px] text-right">{children}</span>
    </div>
  );
}

function getInitialSelectedResorts(resorts: { slug: string }[], searchParams: URLSearchParams | null) {
  const query = searchParams?.get("resorts");
  if (!query) {
    return [resorts[0].slug, resorts[1].slug, resorts[2].slug];
  }

  const requested = Array.from(
    new Set(
      query
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean)
    )
  );

  const selected = requested.filter((slug) =>
    resorts.some((resort) => resort.slug === slug)
  );

  return selected.length > 0
    ? selected.slice(0, MAX_SELECT)
    : [resorts[0].slug, resorts[1].slug, resorts[2].slug];
}
