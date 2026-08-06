"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/GlassCard";
import { DifficultyLegend } from "@/components/DifficultyMark";
import { useLocalizedResorts } from "@/lib/useLocalizedResorts";
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
  const resorts = useLocalizedResorts();
  const searchParams = useSearchParams();

  // ── 横向：选择雪场 ──────────────────────────────
  const [selectedResorts, setSelectedResorts] = useState<string[]>(() =>
    getInitialSelectedResorts(resorts, searchParams)
  );

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

  // ── 派生数据 ─────────────────────────────────────
  const activeResorts = resorts.filter((r) => selectedResorts.includes(r.slug));
  const activeMetrics = ALL_METRICS.filter((m) =>
    selectedMetrics.includes(m.id)
  );

  // next-intl 的 t 需要 as unknown as TFunction 以适配 compareMetrics 内部签名
  const tAsMetricFn = t as unknown as TFunction;

  return (
    <div className="mx-8 mb-12">
      {/* ── 标题区 ────────────────────────────────── */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
          <p className="mt-1.5 text-sm text-ink-muted">
            {t("subtitle", { max: MAX_SELECT })}
          </p>
        </div>
      </div>

      {/* ── 雪场选择器（横向） ─────────────────────── */}
      <GlassCard className="p-4 mb-4" frost={false}>
        <div className="flex flex-wrap gap-2">
          {resorts.map((r) => {
            const active = selectedResorts.includes(r.slug);
            const disabled = !active && selectedResorts.length >= MAX_SELECT;
            return (
              <button
                key={r.slug}
                onClick={() => toggleResort(r.slug)}
                disabled={disabled}
                className={clsx(
                  "px-4 py-2 rounded-full text-sm transition-colors border",
                  active
                    ? "bg-accent-ice text-white border-accent-ice"
                    : "bg-white/40 text-ink-muted border-transparent hover:bg-white/70",
                  disabled && "opacity-40 cursor-not-allowed"
                )}
              >
                {r.name}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* ── 对比项选择器（纵向） ───────────────────── */}
      <GlassCard className="p-4 mb-8" frost={false}>
        <p className="text-xs font-semibold text-ink-muted mb-3 tracking-wide uppercase">
          {t("metricSectionTitle")}
        </p>
        <div className="flex flex-wrap gap-2">
          {ALL_METRICS.map((metric) => {
            const active = selectedMetrics.includes(metric.id);
            return (
              <button
                key={metric.id}
                onClick={() => toggleMetric(metric.id)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                  active
                    ? "bg-accent-ice/15 text-accent-ice border-accent-ice/40 shadow-sm"
                    : "bg-white/30 text-ink-muted border-transparent hover:bg-white/60"
                )}
              >
                {/* 渲染标签：labelKey 形如 "metrics.basePrice" */}
                {t(metric.labelKey as Parameters<typeof t>[0])}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* ── 对比卡片区 ────────────────────────────── */}
      {activeResorts.length === 0 ? (
        <p className="text-sm text-ink-muted">{t("emptyHint")}</p>
      ) : activeMetrics.length === 0 ? (
        <p className="text-sm text-ink-muted">{t("emptyMetrics")}</p>
      ) : (
        <div
          className="grid gap-5 justify-center"
          style={{
            gridTemplateColumns: `repeat(${activeResorts.length}, minmax(260px, 440px))`,
          }}
        >
          {activeResorts.map((r) => (
            <GlassCard key={r.slug} className="p-6 flex flex-col">
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
                        {metric.renderCell(r, tAsMetricFn)}
                      </div>
                    </div>
                  ) : (
                    /* 普通行 */
                    <Row
                      key={metric.id}
                      label={t(metric.labelKey as Parameters<typeof t>[0])}
                    >
                      {metric.renderCell(r, tAsMetricFn)}
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
