"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MLMap,
  NavigationControl,
  MapGeoJSONFeature,
  setWorkerUrl,
} from "maplibre-gl";
import { useLocale } from "next-intl";
import { resorts } from "@/lib/resorts";
import { resortPolygons } from "@/lib/resort-polygons";
import { REGIONS, OVERVIEW_CAMERA, getRegionById } from "@/lib/regions";
import { getMapStyleUrl } from "@/lib/mapStyle";

if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}

const HIDDEN_REGION = "__none__";

// ── OSM 数据类型 ────────────────────────────────────────────────────────────

interface OsmRunProperties {
  osmId: number;
  name: string | null;
  nameJa: string | null;
  nameEn?: string | null;
  nameZh?: string | null;
  pisteType: string;
  difficulty: string | null;
  grooming: string | null;
  lit: string | null;
  distanceM: number;
  descentM: number | null;
  avgSlope: number | null;
  maxSlope: number | null;
}

interface OsmLiftProperties {
  osmId: number;
  name: string | null;
  nameJa: string | null;
  nameEn?: string | null;
  nameZh?: string | null;
  aerialwayType: string;
  capacity: number | null;
  duration: string | null;
  occupancy: number | null;
  bubble: string | null;
  heating: string | null;
  distanceM: number;
  verticalM: number | null;
  avgSlope: number | null;
  access: string | null;
}

interface OsmData {
  slug: string;
  fetchedAt: string;
  runs: GeoJSON.FeatureCollection<GeoJSON.LineString, OsmRunProperties>;
  lifts: GeoJSON.FeatureCollection<GeoJSON.LineString, OsmLiftProperties>;
}

type PopupInfo =
  | { kind: "run"; props: OsmRunProperties; lngLat: [number, number] }
  | { kind: "lift"; props: OsmLiftProperties; lngLat: [number, number] };

// ── 难度颜色映射（与 OpenSkiMap 保持一致）────────────────────────────────
const DIFFICULTY_COLOR: Record<string, string> = {
  novice: "#4caf50",    // 绿
  easy: "#4caf50",      // 绿
  intermediate: "#2196f3", // 蓝
  advanced: "#f44336",  // 红
  expert: "#1a1a1a",    // 黑
  freeride: "#9c27b0",  // 紫（off-piste）
  extreme: "#1a1a1a",   // 黑
};

function getDifficultyColor(difficulty: string | null): string {
  if (!difficulty) return "#9e9e9e";
  return DIFFICULTY_COLOR[difficulty] ?? "#9e9e9e";
}

// ── lift 类型颜色（橙色系）────────────────────────────────────────────────
const LIFT_COLOR = "#ff8c00";

// ── Polygon 相关工具函数 ──────────────────────────────────────────────────

function isMultiPolygon(poly: [number, number][] | [number, number][][]): poly is [number, number][][] {
  return Array.isArray(poly[0]) && Array.isArray(poly[0][0]);
}

function toFeatureCollection(names: Record<string, string>) {
  return {
    type: "FeatureCollection" as const,
    features: resorts.map((r) => {
      const poly = resortPolygons[r.slug];
      if (poly && isMultiPolygon(poly)) {
        return {
          type: "Feature" as const,
          properties: { slug: r.slug, name: names[r.slug] ?? r.slug, regionId: r.regionId },
          geometry: {
            type: "MultiPolygon" as const,
            coordinates: poly.map((subPoly) => [subPoly]),
          },
        };
      }
      return {
        type: "Feature" as const,
        properties: { slug: r.slug, name: names[r.slug] ?? r.slug, regionId: r.regionId },
        geometry: {
          type: "Polygon" as const,
          coordinates: poly ? [poly] : [],
        },
      };
    }),
  };
}

function getSingleCentroid(polygon: [number, number][]): [number, number] {
  const pts =
    polygon.length > 1 &&
      polygon[0][0] === polygon[polygon.length - 1][0] &&
      polygon[0][1] === polygon[polygon.length - 1][1]
      ? polygon
      : [...polygon, polygon[0]];

  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const cross = x0 * y1 - x1 * y0;
    area += cross;
    cx += (x0 + x1) * cross;
    cy += (y0 + y1) * cross;
  }
  area *= 0.5;

  if (Math.abs(area) < 1e-12) {
    const unique = pts.slice(0, -1);
    const [lngSum, latSum] = unique.reduce(
      (acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat],
      [0, 0]
    );
    return [lngSum / unique.length, latSum / unique.length];
  }
  return [cx / (6 * area), cy / (6 * area)];
}

function getAreaCentroid(polygon: [number, number][] | [number, number][][]): [number, number] {
  if (isMultiPolygon(polygon)) {
    const centers = polygon.map(getSingleCentroid);
    const [lngSum, latSum] = centers.reduce(
      (acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat],
      [0, 0]
    );
    return [lngSum / centers.length, latSum / centers.length];
  }
  return getSingleCentroid(polygon);
}

function getResortBounds(
  polygon: [number, number][] | [number, number][][]
): [[number, number], [number, number]] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  const processPoint = ([lng, lat]: [number, number]) => {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  };

  if (isMultiPolygon(polygon)) {
    polygon.forEach((subPoly) => subPoly.forEach(processPoint));
  } else {
    polygon.forEach(processPoint);
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

function toPointCollection(names: Record<string, string>) {
  return {
    type: "FeatureCollection" as const,
    features: resorts.map((r) => {
      const poly = resortPolygons[r.slug];
      const coords: [number, number] = poly ? getAreaCentroid(poly) : [r.lng, r.lat];
      return {
        type: "Feature" as const,
        properties: { slug: r.slug, name: names[r.slug] ?? r.slug, regionId: r.regionId },
        geometry: { type: "Point" as const, coordinates: coords },
      };
    }),
  };
}

/** 大区域边界，用于俯瞰视图的填色/描边图层 */
function toRegionBoundaryCollection() {
  return {
    type: "FeatureCollection" as const,
    features: REGIONS.map((region) => ({
      type: "Feature" as const,
      properties: { regionId: region.id },
      geometry: {
        type: "Polygon" as const,
        coordinates: [region.boundary],
      },
    })),
  };
}

/**
 * 大区域名称
 */
function toRegionLabelCollection(regionNames: Record<string, string>) {
  return {
    type: "FeatureCollection" as const,
    features: REGIONS.map((region) => {
      const count = resorts.filter((r) => r.regionId === region.id).length;
      const label = regionNames[region.id] ?? region.id;
      return {
        type: "Feature" as const,
        properties: { regionId: region.id, name: `${label} · ${count}` },
        geometry: { type: "Point" as const, coordinates: getAreaCentroid(region.boundary) },
      };
    }),
  };
}

// ── 格式化工具 ────────────────────────────────────────────────────────────

function fmtDist(m: number | null | undefined): string {
  if (m == null) return "—";
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m} m`;
}

function fmtVertical(m: number | null | undefined): string {
  if (m == null) return "—";
  return `${m} m`;
}

function fmtSlope(pct: number | null | undefined): string {
  if (pct == null) return "—";
  const deg = Math.round(Math.atan(pct / 100) * (180 / Math.PI));
  return `${deg}° (${pct}%)`;
}

// ── 多语言字典 ─────────────────────────────────────────────────────────────

const OSM_I18N = {
  zh: {
    downhillRun: "高山雪道",
    distance: "长度",
    descent: "相对落差",
    vertical: "爬升高差",
    avgSlope: "平均坡度",
    maxSlope: "最大坡度",
    capacity: "运力",
    paxPerHour: "人/小时",
    seats: "乘员数",
    duration: "运行时间",
    bubble: "带防风罩",
    heated: "带加热座椅",
    source: "数据来源: OpenStreetMap",
    loading: "正在加载雪道与缆车…",
    difficulty: {
      novice: "初学者",
      easy: "初级",
      intermediate: "中级",
      advanced: "高级",
      expert: "专家级",
      freeride: "野雪道",
      extreme: "极限级",
    },
    aerialway: {
      gondola: "厢式缆车 (Gondola)",
      cable_car: "大型索道缆车 (Cable Car)",
      chair_lift: "吊椅缆车 (Chair Lift)",
      mixed_lift: "混合缆车 (Telemix)",
      "t-bar": "T型拖牵",
      platter: "盘式拖牵",
      rope_tow: "绳索拖牵",
      magic_carpet: "魔毯",
      "j-bar": "J型拖牵",
      station: "缆车站",
    },
  },
  ja: {
    downhillRun: "ゲレンデコース",
    distance: "滑走距離",
    descent: "標高差",
    vertical: "標高差",
    avgSlope: "平均斜度",
    maxSlope: "最大斜度",
    capacity: "輸送能力",
    paxPerHour: "人/時間",
    seats: "定員",
    duration: "所要時間",
    bubble: "フード付き",
    heated: "シートヒーター付き",
    source: "出典: OpenStreetMap",
    loading: "コース・リフトを読み込み中…",
    difficulty: {
      novice: "初心者",
      easy: "初級",
      intermediate: "中級",
      advanced: "上級",
      expert: "エキスパート",
      freeride: "フリーライド",
      extreme: "超上級",
    },
    aerialway: {
      gondola: "ゴンドラ",
      cable_car: "ロープウェイ",
      chair_lift: "リフト",
      mixed_lift: "コンビリフト",
      "t-bar": "Tバーリフト",
      platter: "プラッターリフト",
      rope_tow: "ロープトゥ",
      magic_carpet: "ベルトリフト",
      "j-bar": "Jバーリフト",
      station: "駅・乗り場",
    },
  },
  en: {
    downhillRun: "Downhill ski run",
    distance: "Distance",
    descent: "Descent",
    vertical: "Vertical",
    avgSlope: "Average Slope",
    maxSlope: "Max Slope",
    capacity: "Capacity",
    paxPerHour: "pax/hr",
    seats: "Seats",
    duration: "Duration",
    bubble: "Bubble / Cover",
    heated: "Heated Seats",
    source: "Source: OpenStreetMap",
    loading: "Loading trails…",
    difficulty: {
      novice: "Novice",
      easy: "Easy",
      intermediate: "Intermediate",
      advanced: "Advanced",
      expert: "Expert",
      freeride: "Freeride",
      extreme: "Extreme",
    },
    aerialway: {
      gondola: "Gondola",
      cable_car: "Cable Car",
      chair_lift: "Chair Lift",
      mixed_lift: "Mixed Lift",
      "t-bar": "T-Bar",
      platter: "Platter",
      rope_tow: "Rope Tow",
      magic_carpet: "Magic Carpet",
      "j-bar": "J-Bar",
      station: "Station",
    },
  },
} as const;

function getOsmDict(locale: string) {
  if (locale === "ja") return OSM_I18N.ja;
  if (locale === "en") return OSM_I18N.en;
  return OSM_I18N.zh;
}

function aerialwayLabel(type: string, locale: string): string {
  const dict = getOsmDict(locale);
  return (dict.aerialway as Record<string, string>)[type] ?? type;
}

function difficultyLabel(d: string | null, locale: string): string {
  const dict = getOsmDict(locale);
  return d ? ((dict.difficulty as Record<string, string>)[d] ?? d) : "—";
}

function getLocalizedNames(
  props: { name: string | null; nameJa?: string | null; nameEn?: string | null; nameZh?: string | null; osmId: number },
  locale: string
) {
  const { name, nameJa, nameEn, nameZh, osmId } = props;
  let primary = "";
  let secondary: string | null = null;

  if (locale === "zh") {
    primary = nameZh ?? nameJa ?? nameEn ?? name ?? `OSM #${osmId}`;
    if (nameJa && nameJa !== primary) secondary = nameJa;
    else if (nameEn && nameEn !== primary) secondary = nameEn;
  } else if (locale === "ja") {
    primary = nameJa ?? name ?? nameEn ?? `OSM #${osmId}`;
    if (nameEn && nameEn !== primary) secondary = nameEn;
  } else {
    // locale === "en"
    primary = nameEn ?? name ?? nameJa ?? `OSM #${osmId}`;
    if (nameJa && nameJa !== primary) secondary = nameJa;
  }

  return { primary, secondary };
}

// ── OSM 图层 ID 常量 ──────────────────────────────────────────────────────

const OSM_LAYER_RUNS = "osm-runs";
const OSM_LAYER_RUNS_HIGHLIGHT = "osm-runs-highlight";
const OSM_LAYER_LIFTS = "osm-lifts";
const OSM_LAYER_LIFTS_HIGHLIGHT = "osm-lifts-highlight";
const OSM_SOURCE_RUNS = "osm-runs-source";
const OSM_SOURCE_LIFTS = "osm-lifts-source";

// ── 弹窗组件 ─────────────────────────────────────────────────────────────

function RunPopup({
  props,
  locale,
  onClose,
}: {
  props: OsmRunProperties;
  locale: string;
  onClose: () => void;
}) {
  const dict = getOsmDict(locale);
  const color = getDifficultyColor(props.difficulty);
  const { primary, secondary } = getLocalizedNames(props, locale);
  const diffText = difficultyLabel(props.difficulty, locale);

  return (
    <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 p-4 min-w-[240px] max-w-[300px]">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-block w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">
            {diffText !== "—" ? `${diffText} · ` : ""}{dict.downhillRun}
          </span>
        </div>
        <h3 className="text-[15px] font-bold text-gray-900 leading-tight">{primary}</h3>
        {secondary && (
          <p className="text-[12px] text-gray-500 mt-0.5">{secondary}</p>
        )}
      </div>

      <div className="space-y-1.5 text-[13px]">
        <StatRow label={dict.distance} value={fmtDist(props.distanceM)} />
        <StatRow label={dict.descent} value={fmtVertical(props.descentM)} />
        <StatRow label={dict.avgSlope} value={fmtSlope(props.avgSlope)} />
        <StatRow label={dict.maxSlope} value={fmtSlope(props.maxSlope)} />
      </div>

      <p className="mt-3 text-[10px] text-gray-400">{dict.source}</p>
    </div>
  );
}

function LiftPopup({
  props,
  locale,
  onClose,
}: {
  props: OsmLiftProperties;
  locale: string;
  onClose: () => void;
}) {
  const dict = getOsmDict(locale);
  const { primary, secondary } = getLocalizedNames(props, locale);

  return (
    <div className="relative bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 p-4 min-w-[240px] max-w-[300px]">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
        aria-label="Close"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: LIFT_COLOR }} />
          <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wide">
            {aerialwayLabel(props.aerialwayType, locale)}
          </span>
        </div>
        <h3 className="text-[15px] font-bold text-gray-900 leading-tight">{primary}</h3>
        {secondary && (
          <p className="text-[12px] text-gray-500 mt-0.5">{secondary}</p>
        )}
      </div>

      <div className="space-y-1.5 text-[13px]">
        <StatRow label={dict.distance} value={fmtDist(props.distanceM)} />
        <StatRow label={dict.vertical} value={fmtVertical(props.verticalM)} />
        <StatRow label={dict.avgSlope} value={fmtSlope(props.avgSlope)} />
        {props.capacity != null && <StatRow label={dict.capacity} value={`${props.capacity} ${dict.paxPerHour}`} />}
        {props.occupancy != null && <StatRow label={dict.seats} value={`${props.occupancy}`} />}
        {props.duration && <StatRow label={dict.duration} value={props.duration} />}
        {props.bubble === "yes" && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-[11px] text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-medium">{dict.bubble}</span>
          </div>
        )}
        {props.heating === "yes" && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full font-medium">{dict.heated}</span>
          </div>
        )}
      </div>

      <p className="mt-3 text-[10px] text-gray-400">{dict.source}</p>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────────────

export function ResortMap({
  onSelect,
  selectedSlug,
  activeRegion: activeRegionProp,
  onRegionSelect,
  names = {},
  regionNames = {},
  backLabel = "Back",
  backToRegionLabel = "Back to Region",
  backButtonPosition = "top-left",
}: {
  onSelect?: (slug: string | null) => void;
  selectedSlug?: string | null;
  activeRegion?: string | null;
  onRegionSelect?: (regionId: string | null) => void;
  /** slug -> 当前界面语言下的雪场名称，用于地图标注 */
  names?: Record<string, string>;
  /** regionId -> 当前界面语言下的大区域名称，用于俯瞰视图标注文字 */
  regionNames?: Record<string, string>;
  /** "返回全览"按钮文字 */
  backLabel?: string;
  /** "返回当前区域"按钮文字 */
  backToRegionLabel?: string;
  /** 返回按钮位置，首页使用 hero-right 摆放在 Hero 卡片右侧 */
  backButtonPosition?: "top-left" | "hero-right";
}) {
  const currentLocale = useLocale();
  const locale = (currentLocale === "ja" || currentLocale === "en") ? currentLocale : "zh";
  const dict = getOsmDict(locale);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [internalActiveRegion, setInternalActiveRegion] = useState<string | null>(null);
  const [osmLoading, setOsmLoading] = useState(false);
  const [popup, setPopup] = useState<PopupInfo | null>(null);
  const hoveredOsmIdRef = useRef<number | null>(null);

  const activeRegion = activeRegionProp !== undefined ? activeRegionProp : internalActiveRegion;

  function applyRegionFilter(map: MLMap, regionId: string | null) {
    const filter: unknown[] = ["==", ["get", "regionId"], regionId ?? HIDDEN_REGION];
    for (const id of ["resort-fill", "resort-outline", "resort-label"]) {
      if (map.getLayer(id)) map.setFilter(id, filter as never);
    }
  }

  function setRegionLayersVisible(map: MLMap, visible: boolean) {
    const v = visible ? "visible" : "none";
    for (const id of ["region-fill", "region-outline", "region-label"]) {
      if (map.getLayer(id)) map.setLayoutProperty(id, "visibility", v);
    }
  }

  function enterRegion(regionId: string) {
    const map = mapRef.current;
    const region = getRegionById(regionId);
    if (!map || !region) return;
    setInternalActiveRegion(regionId);
    onRegionSelect?.(regionId);
    applyRegionFilter(map, regionId);
    setRegionLayersVisible(map, false);
    map.flyTo({ center: region.center, zoom: region.zoom, duration: 1200 });
  }

  function backToOverview() {
    const map = mapRef.current;
    if (!map) return;
    setInternalActiveRegion(null);
    onRegionSelect?.(null);
    onSelect?.(null);
    applyRegionFilter(map, null);
    setRegionLayersVisible(map, true);
    map.flyTo({ center: OVERVIEW_CAMERA.center, zoom: OVERVIEW_CAMERA.zoom, duration: 1200 });
    removeOsmLayers(map);
    setPopup(null);
  }

  // ── OSM 图层管理 ─────────────────────────────────────────────────────────

  function removeOsmLayers(map: MLMap) {
    for (const id of [OSM_LAYER_RUNS_HIGHLIGHT, OSM_LAYER_LIFTS_HIGHLIGHT, OSM_LAYER_RUNS, OSM_LAYER_LIFTS]) {
      if (map.getLayer(id)) map.removeLayer(id);
    }
    for (const id of [OSM_SOURCE_RUNS, OSM_SOURCE_LIFTS]) {
      if (map.getSource(id)) map.removeSource(id);
    }
  }

  function addOsmLayers(map: MLMap, osmData: OsmData) {
    removeOsmLayers(map);

    // ── Runs source + layers ──────────────────────────────────────────────
    map.addSource(OSM_SOURCE_RUNS, {
      type: "geojson",
      data: osmData.runs as unknown as GeoJSON.GeoJSON,
      generateId: true,
    });

    // 主线（按难度着色）
    map.addLayer({
      id: OSM_LAYER_RUNS,
      type: "line",
      source: OSM_SOURCE_RUNS,
      paint: {
        "line-color": [
          "match", ["get", "difficulty"],
          "novice",       "#4caf50",
          "easy",         "#4caf50",
          "intermediate", "#2196f3",
          "advanced",     "#f44336",
          "expert",       "#1a1a1a",
          "freeride",     "#9c27b0",
          "#9e9e9e",
        ],
        "line-width": 2.5,
        "line-opacity": 0.9,
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    // 高亮线（hover/selected）
    map.addLayer({
      id: OSM_LAYER_RUNS_HIGHLIGHT,
      type: "line",
      source: OSM_SOURCE_RUNS,
      paint: {
        "line-color": "#ffffff",
        "line-width": 5,
        "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.9, 0],
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    // ── Lifts source + layers ─────────────────────────────────────────────
    map.addSource(OSM_SOURCE_LIFTS, {
      type: "geojson",
      data: osmData.lifts as unknown as GeoJSON.GeoJSON,
      generateId: true,
    });

    map.addLayer({
      id: OSM_LAYER_LIFTS,
      type: "line",
      source: OSM_SOURCE_LIFTS,
      filter: ["!=", ["get", "aerialwayType"], "station"],
      paint: {
        "line-color": LIFT_COLOR,
        "line-width": 3,
        "line-opacity": 0.95,
        "line-dasharray": [1, 0], // solid
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    map.addLayer({
      id: OSM_LAYER_LIFTS_HIGHLIGHT,
      type: "line",
      source: OSM_SOURCE_LIFTS,
      filter: ["!=", ["get", "aerialwayType"], "station"],
      paint: {
        "line-color": "#ffffff",
        "line-width": 6,
        "line-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.85, 0],
      },
      layout: { "line-cap": "round", "line-join": "round" },
    });

    // ── 交互：hover ───────────────────────────────────────────────────────
    map.on("mousemove", OSM_LAYER_RUNS, (e) => {
      map.getCanvas().style.cursor = "pointer";
      const f = e.features?.[0];
      if (f?.id != null && f.id !== hoveredOsmIdRef.current) {
        if (hoveredOsmIdRef.current != null) {
          map.setFeatureState({ source: OSM_SOURCE_RUNS, id: hoveredOsmIdRef.current }, { hover: false });
        }
        hoveredOsmIdRef.current = f.id as number;
        map.setFeatureState({ source: OSM_SOURCE_RUNS, id: f.id }, { hover: true });
      }
    });

    map.on("mouseleave", OSM_LAYER_RUNS, () => {
      map.getCanvas().style.cursor = "";
      if (hoveredOsmIdRef.current != null) {
        map.setFeatureState({ source: OSM_SOURCE_RUNS, id: hoveredOsmIdRef.current }, { hover: false });
        hoveredOsmIdRef.current = null;
      }
    });

    map.on("mousemove", OSM_LAYER_LIFTS, (e) => {
      map.getCanvas().style.cursor = "pointer";
      const f = e.features?.[0];
      if (f?.id != null && f.id !== hoveredOsmIdRef.current) {
        if (hoveredOsmIdRef.current != null) {
          map.setFeatureState({ source: OSM_SOURCE_LIFTS, id: hoveredOsmIdRef.current }, { hover: false });
        }
        hoveredOsmIdRef.current = f.id as number;
        map.setFeatureState({ source: OSM_SOURCE_LIFTS, id: f.id }, { hover: true });
      }
    });

    map.on("mouseleave", OSM_LAYER_LIFTS, () => {
      map.getCanvas().style.cursor = "";
      if (hoveredOsmIdRef.current != null) {
        map.setFeatureState({ source: OSM_SOURCE_LIFTS, id: hoveredOsmIdRef.current }, { hover: false });
        hoveredOsmIdRef.current = null;
      }
    });

    // ── 交互：click ───────────────────────────────────────────────────────
    map.on("click", OSM_LAYER_RUNS, (e) => {
      const f = e.features?.[0] as MapGeoJSONFeature | undefined;
      if (!f) return;
      const props = f.properties as OsmRunProperties;
      setPopup({
        kind: "run",
        props,
        lngLat: [e.lngLat.lng, e.lngLat.lat],
      });
    });

    map.on("click", OSM_LAYER_LIFTS, (e) => {
      const f = e.features?.[0] as MapGeoJSONFeature | undefined;
      if (!f) return;
      const props = f.properties as OsmLiftProperties;
      setPopup({
        kind: "lift",
        props,
        lngLat: [e.lngLat.lng, e.lngLat.lat],
      });
    });
  }

  async function loadOsmData(slug: string) {
    const map = mapRef.current;
    if (!map) return;
    setOsmLoading(true);
    setPopup(null);
    try {
      const res = await fetch(`/osm/${slug}.json`);
      if (!res.ok) {
        // 数据文件不存在，静默失败
        removeOsmLayers(map);
        return;
      }
      const osmData: OsmData = await res.json();
      if (map.isStyleLoaded()) {
        addOsmLayers(map, osmData);
      } else {
        map.once("idle", () => addOsmLayers(map, osmData));
      }
    } catch {
      // 网络错误等，静默处理
      removeOsmLayers(map);
    } finally {
      setOsmLoading(false);
    }
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new MLMap({
      container: containerRef.current,
      style: getMapStyleUrl(),
      center: OVERVIEW_CAMERA.center,
      zoom: OVERVIEW_CAMERA.zoom,
      pitch: 0,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    map.on("error", (e) => {
      console.error("MapLibre error:", e);
    });

    map.on("load", () => {
      map.resize();
      map.jumpTo({ center: OVERVIEW_CAMERA.center, zoom: OVERVIEW_CAMERA.zoom });

      // 延迟 100ms 进行二次尺寸调整与中心校准，保证在 flex 容器拉伸完毕后地图完美居中
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
          mapRef.current.jumpTo({ center: OVERVIEW_CAMERA.center, zoom: OVERVIEW_CAMERA.zoom });
        }
      }, 100);

      // ── 大区域边界 + 名字标注（俯瞰视图专用，进入某区域后隐藏）──────
      map.addSource("region-boundaries", {
        type: "geojson",
        data: toRegionBoundaryCollection(),
        generateId: true,
      });
      map.addSource("region-points", {
        type: "geojson",
        data: toRegionLabelCollection(regionNames),
      });

      map.addLayer({
        id: "region-fill",
        type: "fill",
        source: "region-boundaries",
        paint: {
          "fill-color": "#2e7dd1",
          "fill-opacity": ["case", ["boolean", ["feature-state", "active"], false], 0.28, 0.1],
        },
      });

      map.addLayer({
        id: "region-outline",
        type: "line",
        source: "region-boundaries",
        paint: {
          "line-color": "#2e7dd1",
          "line-width": ["case", ["boolean", ["feature-state", "active"], false], 2.2, 1.4],
          "line-dasharray": [2, 1.5],
          "line-opacity": 0.75,
        },
      });

      map.addLayer({
        id: "region-label",
        type: "symbol",
        source: "region-points",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 14.5,
          "text-offset": [0, 0.4],
          "text-anchor": "center",
          "text-allow-overlap": true,
          "symbol-placement": "point",
        },
        paint: {
          "text-color": "#101826",
          "text-halo-color": "#f7fafd",
          "text-halo-width": 1.8,
        },
      });

      // ── 雪场色块 + 名称标注（默认隐藏，进入对应大区域后才按 regionId 过滤显示）──
      map.addSource("resort-areas", {
        type: "geojson",
        data: toFeatureCollection(names),
        generateId: true,
      });
      map.addSource("resort-points", {
        type: "geojson",
        data: toPointCollection(names),
        generateId: true,
      });

      map.addLayer({
        id: "resort-fill",
        type: "fill",
        source: "resort-areas",
        filter: ["==", ["get", "regionId"], HIDDEN_REGION],
        paint: {
          "fill-color": "#2e7dd1",
          "fill-opacity": ["case", ["boolean", ["feature-state", "active"], false], 0.45, 0.16],
        },
      });

      map.addLayer({
        id: "resort-outline",
        type: "line",
        source: "resort-areas",
        filter: ["==", ["get", "regionId"], HIDDEN_REGION],
        paint: {
          "line-color": "#2e7dd1",
          "line-width": ["case", ["boolean", ["feature-state", "active"], false], 2.4, 1.2],
          "line-opacity": 0.85,
        },
      });

      // 雪场名称文本标注
      map.addLayer({
        id: "resort-label",
        type: "symbol",
        source: "resort-points",
        filter: ["==", ["get", "regionId"], HIDDEN_REGION],
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Noto Sans Regular"],
          "text-size": 12.5,
          "text-offset": [0, 0.4],
          "text-anchor": "center",
          "text-allow-overlap": true,
          "symbol-placement": "point",
        },
        paint: {
          "text-color": "#101826",
          "text-halo-color": "#f7fafd",
          "text-halo-width": 1.6,
        },
      });

      // 大区域：色块 + 文字标注，两者都可 hover / click
      for (const layerId of ["region-fill", "region-label"]) {
        map.on("mousemove", layerId, (e) => {
          map.getCanvas().style.cursor = "pointer";
          const f = e.features?.[0] as MapGeoJSONFeature | undefined;
          if (f) setHoveredRegion(f.properties?.regionId as string);
        });
        map.on("mouseleave", layerId, () => {
          map.getCanvas().style.cursor = "";
          setHoveredRegion(null);
        });
        map.on("click", layerId, (e) => {
          const f = e.features?.[0] as MapGeoJSONFeature | undefined;
          const regionId = f?.properties?.regionId as string | undefined;
          if (regionId) enterRegion(regionId);
        });
      }

      // 雪场：色块与名称文字均可 hover & click
      for (const layerId of ["resort-fill", "resort-label"]) {
        map.on("mousemove", layerId, (e) => {
          map.getCanvas().style.cursor = "pointer";
          const f = e.features?.[0] as MapGeoJSONFeature | undefined;
          if (f) setHovered(f.properties?.slug as string);
        });
        map.on("mouseleave", layerId, () => {
          map.getCanvas().style.cursor = "";
          setHovered(null);
        });
        map.on("click", layerId, (e) => {
          const f = e.features?.[0] as MapGeoJSONFeature | undefined;
          const slug = f?.properties?.slug as string | undefined;
          if (slug && onSelect) onSelect(slug);
        });
      }

      // 初始化地图状态（若挂载时已有 selectedSlug 或 activeRegion）
      const initialRegion = selectedSlug
        ? resorts.find((r) => r.slug === selectedSlug)?.regionId ?? activeRegion
        : activeRegion;
      if (initialRegion) {
        applyRegionFilter(map, initialRegion);
        setRegionLayersVisible(map, false);
      }
      if (selectedSlug) {
        const resort = resorts.find((r) => r.slug === selectedSlug);
        if (resort) {
          const poly = resortPolygons[resort.slug];
          if (poly) {
            const bounds = getResortBounds(poly);
            map.fitBounds(bounds, { padding: 60, maxZoom: 13.8, animate: false });
          } else {
            map.jumpTo({ center: [resort.lng, resort.lat], zoom: 12 });
          }
        }
      } else if (activeRegion) {
        const region = getRegionById(activeRegion);
        if (region) {
          map.jumpTo({ center: region.center, zoom: region.zoom });
        }
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 高亮当前选中/hover的雪场色块与地图定位点
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const setActive = () => {
      resorts.forEach((r, idx) => {
        const active = r.slug === selectedSlug || r.slug === hovered;
        try {
          map.setFeatureState({ source: "resort-areas", id: idx }, { active });
          map.setFeatureState({ source: "resort-points", id: idx }, { active });
        } catch {
          /* style not ready yet */
        }
      });
    };
    if (map.isStyleLoaded()) setActive();
    else map.once("idle", setActive);
  }, [hovered, selectedSlug]);

  // 高亮当前hover的大区域边界
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const setActive = () => {
      REGIONS.forEach((region, idx) => {
        try {
          map.setFeatureState(
            { source: "region-boundaries", id: idx },
            { active: region.id === hoveredRegion }
          );
        } catch {
          /* style not ready yet */
        }
      });
    };
    if (map.isStyleLoaded()) setActive();
    else map.once("idle", setActive);
  }, [hoveredRegion]);

  // 外部改变了 activeRegionProp（比如侧栏点了某个大区域）：飞进/飞出该区域
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedSlug) return;
    if (activeRegionProp) {
      const region = getRegionById(activeRegionProp);
      if (region) {
        applyRegionFilter(map, activeRegionProp);
        setRegionLayersVisible(map, false);
        map.flyTo({ center: region.center, zoom: region.zoom, duration: 1200 });
      }
    } else if (activeRegionProp === null) {
      applyRegionFilter(map, null);
      setRegionLayersVisible(map, true);
      map.flyTo({ center: OVERVIEW_CAMERA.center, zoom: OVERVIEW_CAMERA.zoom, duration: 1200 });
      removeOsmLayers(map);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRegionProp]);

  // 外部（比如侧栏点了某个雪场）改变了 selectedSlug：
  // 地图视角定位转移到该雪场中心，并按合适比例放大视角，同时加载 OSM 图层
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (selectedSlug) {
      const resort = resorts.find((r) => r.slug === selectedSlug);
      if (resort) {
        applyRegionFilter(map, resort.regionId);
        setRegionLayersVisible(map, false);
        const poly = resortPolygons[resort.slug];
        if (poly) {
          const bounds = getResortBounds(poly);
          map.fitBounds(bounds, { padding: 60, maxZoom: 13.8, duration: 1200 });
        } else {
          map.flyTo({ center: [resort.lng, resort.lat], zoom: 12, duration: 1200 });
        }
        // 加载 OSM 雪道/lift 图层
        loadOsmData(selectedSlug);
      }
    } else if (activeRegionProp) {
      applyRegionFilter(map, activeRegionProp);
      setRegionLayersVisible(map, false);
      const region = getRegionById(activeRegionProp);
      if (region) {
        map.flyTo({ center: region.center, zoom: region.zoom, duration: 1200 });
      }
      removeOsmLayers(map);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);

  function handleBackClick() {
    if (selectedSlug) {
      onSelect?.(null);
      const map = mapRef.current;
      if (map) { removeOsmLayers(map); }
      setPopup(null);
    } else {
      backToOverview();
    }
  }

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-[20px] sm:rounded-[28px] overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* 返回按钮 */}
      {(activeRegion || selectedSlug) && (
        <button
          onClick={handleBackClick}
          className={`absolute z-10 flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full glass-strong text-xs sm:text-sm font-medium text-ink hover:bg-white/80 transition-colors shadow-[0_10px_30px_-16px_rgba(30,91,163,0.45)] ${backButtonPosition === "hero-right"
            ? "top-4 left-[396px] sm:top-6 sm:left-[476px] lg:top-8 lg:left-[504px]"
            : "top-4 left-4"
            }`}
        >
          ← {selectedSlug ? backToRegionLabel : backLabel}
        </button>
      )}

      {/* OSM 加载指示器 */}
      {osmLoading && (
        <div className="absolute top-4 right-14 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-white/60 text-xs text-gray-600">
          <svg className="animate-spin w-3 h-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {dict.loading}
        </div>
      )}

      {/* 弹窗：点击雪道/lift 显示详情 */}
      {popup && (
        <div className="absolute z-20 bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
          {popup.kind === "run" ? (
            <RunPopup props={popup.props} locale={locale} onClose={() => setPopup(null)} />
          ) : (
            <LiftPopup props={popup.props} locale={locale} onClose={() => setPopup(null)} />
          )}
        </div>
      )}
    </div>
  );
}