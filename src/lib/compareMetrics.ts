/**
 * compareMetrics.ts — 纵向对比项配置中心
 *
 * ─ 新增对比项：在 ALL_METRICS 数组末尾追加一条对象，
 *              并在 messages/{en,ja,zh}.json 的 compare.metrics 下各加一行翻译。
 * ─ 删除对比项：从 ALL_METRICS 中删除对应对象即可。
 * ─ 修改渲染逻辑：编辑对应 metric 的 renderCell / renderHeader 函数。
 * ─ 修改标签文字：编辑 messages/{locale}.json 中 compare.metrics.{id}。
 */

import React from "react";
import type { LocalizedResort } from "./getLocalizedResorts";
import { formatCarMin, formatShinkansenMin } from "./utils";

// ────────────────────────────────────────────────────
// 类型定义
// ────────────────────────────────────────────────────

export type MetricId =
  | "basePrice"
  | "seasonPass"
  | "vertical"
  | "topElevation"
  | "travel"
  | "car"
  | "courses"
  | "lifts"
  | "difficultyBar"
  | "nightSkiing"
  | "snowPark";

/** i18n 翻译函数类型（来自 useTranslations("compare")） */
export type TFunction = (key: string, values?: Record<string, string | number>) => string;

export interface CompareMetric {
  id: MetricId;
  /** i18n key，对应 compare.metrics.{id} */
  labelKey: string;
  /**
   * 渲染单个雪场在该指标下的内容。
   * 返回 React.ReactNode（文字、数字、JSX 均可）。
   * locale: 可选，用于格式化时间（如 'zh' | 'ja' | 'en'）
   */
  renderCell: (resort: LocalizedResort, t: TFunction, locale?: string) => React.ReactNode;
  /**
   * 可选：是否为"大块"行（如难度条），
   * 设为 true 时不走标准 Row 包裹，页面自行处理布局。
   */
  isBlock?: boolean;
}

// ────────────────────────────────────────────────────
// 所有对比项定义
// ────────────────────────────────────────────────────

export const ALL_METRICS: CompareMetric[] = [
  // ── 价格 ──────────────────────────────────────────
  {
    id: "basePrice",
    labelKey: "metrics.basePrice",
    renderCell: (r) =>
      React.createElement(
        "span",
        { className: "font-data font-bold text-accent-ice" },
        `¥${r.basePrice.toLocaleString()}`
      ),
  },
  {
    id: "seasonPass",
    labelKey: "metrics.seasonPass",
    renderCell: (r) =>
      r.seasonPassPrice > 0
        ? React.createElement("span", { className: "font-data" }, `¥${r.seasonPassPrice.toLocaleString()}`)
        : React.createElement("span", { className: "text-ink-faint italic" }, "—"),
  },

  // ── 新干线 ──────────────────────────────────────────
  {
    id: "travel",
    labelKey: "metrics.travel",
    renderCell: (r, t, locale = "zh") =>
      React.createElement("span", null,
        r.travel.shinkansenMin > 0
          ? `${formatShinkansenMin(r.travel.shinkansenMin, locale)} · ¥${r.travel.shinkansenYen.toLocaleString()}`
          : "—"
      )
  },

  // ── 自驾 ──────────────────────────────────────────
  {
    id: "car",
    labelKey: "metrics.car",
    renderCell: (r, _t, locale = "zh") =>
      React.createElement("span", null,
        `${formatCarMin(r.travel.carMin, locale)} · ${r.travel.carKm}km · ¥${r.travel.etcYen.toLocaleString()}`
      ),
  },

  // ── 地形 / 雪道 ───────────────────────────────────
  {
    id: "courses",
    labelKey: "metrics.courses",
    renderCell: (r, t) =>
      React.createElement("span", null, t("coursesValue", { total: r.courses.total, km: r.courses.longestKm })),
  },
  {
    id: "difficultyBar",
    labelKey: "metrics.difficultyBar",
    isBlock: true,
    renderCell: (r) =>
      React.createElement(
        "div",
        { className: "h-2 rounded-full overflow-hidden flex w-full" },
        React.createElement("div", {
          style: {
            width: `${(r.courses.beginner / r.courses.total) * 100}%`,
            background: "var(--piste-green)",
          },
        }),
        React.createElement("div", {
          style: {
            width: `${(r.courses.intermediate / r.courses.total) * 100}%`,
            background: "var(--piste-red)",
          },
        }),
        React.createElement("div", {
          style: {
            width: `${(r.courses.advanced / r.courses.total) * 100}%`,
            background: "var(--piste-black)",
          },
        })
      ),
  },

  // ── 缆车 ──────────────────────────────────────────
  {
    id: "lifts",
    labelKey: "metrics.lifts",
    renderCell: (r, t) =>
      React.createElement(
        "span",
        null,
        t("liftsValue", { total: r.lifts.total, gondola: r.lifts.gondola })
      ),
  },

  // ── 海拔 ──────────────────────────────────────────
  {
    id: "vertical",
    labelKey: "metrics.vertical",
    renderCell: (r) => React.createElement("span", { className: "font-data" }, `${r.elevation.verticalM} m`),
  },
  {
    id: "topElevation",
    labelKey: "metrics.topElevation",
    renderCell: (r) => React.createElement("span", { className: "font-data" }, `${r.elevation.topM} m`),
  },

  // ── 夜场与公园 ───────────────────────────────────
  {
    id: "nightSkiing",
    labelKey: "metrics.nightSkiing",
    renderCell: (r) =>
      r.hasNightSkiing
        ? React.createElement(
            "span",
            { className: "text-accent-ice font-semibold" },
            r.nightSkiingHours ? `有 (${r.nightSkiingHours})` : "有"
          )
        : React.createElement("span", { className: "text-ink-faint" }, "无"),
  },
  {
    id: "snowPark",
    labelKey: "metrics.snowPark",
    renderCell: (r) =>
      r.hasPark
        ? React.createElement("span", { className: "text-accent-ice font-semibold" }, "有")
        : React.createElement("span", { className: "text-ink-faint" }, "无"),
  },
];

// ────────────────────────────────────────────────────
// 默认勾选项（首次进入页面时）
// ────────────────────────────────────────────────────

export const DEFAULT_METRIC_IDS: MetricId[] = [
  "basePrice",
  "seasonPass",
  "vertical",
  "travel",
  "difficultyBar",
];
