"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map as MLMap,
  NavigationControl,
  MapGeoJSONFeature,
  setWorkerUrl,
} from "maplibre-gl";
import { resorts } from "@/lib/resorts";
import { REGIONS, OVERVIEW_CAMERA, getRegionById } from "@/lib/regions";
import { getMapStyleUrl } from "@/lib/mapStyle";

if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}

const HIDDEN_REGION = "__none__";

function toFeatureCollection(names: Record<string, string>) {
  return {
    type: "FeatureCollection" as const,
    features: resorts.map((r) => ({
      type: "Feature" as const,
      properties: { slug: r.slug, name: names[r.slug] ?? r.slug, regionId: r.regionId },
      geometry: {
        type: "Polygon" as const,
        coordinates: [r.areaPolygon],
      },
    })),
  };
}

function getAreaCentroid(polygon: [number, number][]): [number, number] {
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

function toPointCollection(names: Record<string, string>) {
  return {
    type: "FeatureCollection" as const,
    features: resorts.map((r) => ({
      type: "Feature" as const,
      properties: { slug: r.slug, name: names[r.slug] ?? r.slug, regionId: r.regionId },
      geometry: { type: "Point" as const, coordinates: getAreaCentroid(r.areaPolygon) },
    })),
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [internalActiveRegion, setInternalActiveRegion] = useState<string | null>(null);

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

      // ── 雪场色块（默认隐藏，进入对应大区域后才按 regionId 过滤显示）──
      map.addSource("resort-areas", {
        type: "geojson",
        data: toFeatureCollection(names),
        generateId: true,
      });
      map.addSource("resort-points", { type: "geojson", data: toPointCollection(names) });

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

      // 雪场：色块 hover / click
      map.on("mousemove", "resort-fill", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const f = e.features?.[0] as MapGeoJSONFeature | undefined;
        if (f) setHovered(f.properties?.slug as string);
      });
      map.on("mouseleave", "resort-fill", () => {
        map.getCanvas().style.cursor = "";
        setHovered(null);
      });
      map.on("click", "resort-fill", (e) => {
        const f = e.features?.[0] as MapGeoJSONFeature | undefined;
        const slug = f?.properties?.slug as string | undefined;
        if (slug && onSelect) onSelect(slug);
      });

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
          const center = getAreaCentroid(resort.areaPolygon);
          const region = getRegionById(resort.regionId);
          const targetZoom = region ? Math.max(region.zoom + 1.8, 12.5) : 12.5;
          map.jumpTo({ center, zoom: targetZoom });
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

  // 高亮当前选中/hover的雪场色块
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const setActive = () => {
      resorts.forEach((r, idx) => {
        const active = r.slug === selectedSlug || r.slug === hovered;
        try {
          map.setFeatureState({ source: "resort-areas", id: idx }, { active });
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
    }
  }, [activeRegionProp]);

  // 外部（比如侧栏点了某个雪场）改变了 selectedSlug：
  // 地图视角定位转移到该雪场中心，并按合适比例放大视角
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (selectedSlug) {
      const resort = resorts.find((r) => r.slug === selectedSlug);
      if (resort) {
        if (resort.regionId !== activeRegion) {
          setInternalActiveRegion(resort.regionId);
          onRegionSelect?.(resort.regionId);
        }
        applyRegionFilter(map, resort.regionId);
        setRegionLayersVisible(map, false);
        const center = getAreaCentroid(resort.areaPolygon);
        const region = getRegionById(resort.regionId);
        const targetZoom = region ? Math.max(region.zoom + 1.8, 12.5) : 12.5;
        map.flyTo({ center, zoom: targetZoom, duration: 1200 });
      }
    } else if (activeRegionProp) {
      applyRegionFilter(map, activeRegionProp);
      setRegionLayersVisible(map, false);
      const region = getRegionById(activeRegionProp);
      if (region) {
        map.flyTo({ center: region.center, zoom: region.zoom, duration: 1200 });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlug]);

  function handleBackClick() {
    if (selectedSlug) {
      onSelect?.(null);
    } else {
      backToOverview();
    }
  }

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-[20px] sm:rounded-[28px] overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
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
    </div>
  );
}