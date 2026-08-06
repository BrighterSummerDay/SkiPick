"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MLMap, NavigationControl, MapGeoJSONFeature, setWorkerUrl } from "maplibre-gl";
import { resorts } from "@/lib/resorts";
import { getMapStyleUrl } from "@/lib/mapStyle";

if (typeof window !== "undefined") {
  setWorkerUrl("/maplibre-gl-worker.mjs");
}

function toFeatureCollection(names: Record<string, string>) {
  return {
    type: "FeatureCollection" as const,
    features: resorts.map((r) => ({
      type: "Feature" as const,
      properties: { slug: r.slug, name: names[r.slug] ?? r.slug },
      geometry: {
        type: "Polygon" as const,
        coordinates: [r.areaPolygon],
      },
    })),
  };
}

function getAreaCentroid(polygon: [number, number][]) {
  const uniquePoints =
    polygon.length > 1 &&
    polygon[0][0] === polygon[polygon.length - 1][0] &&
    polygon[0][1] === polygon[polygon.length - 1][1]
      ? polygon.slice(0, -1)
      : polygon;

  const [lngSum, latSum] = uniquePoints.reduce(
    (acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat],
    [0, 0],
  );
  const count = uniquePoints.length;
  return [lngSum / count, latSum / count] as [number, number];
}

function toPointCollection(names: Record<string, string>) {
  return {
    type: "FeatureCollection" as const,
    features: resorts.map((r) => ({
      type: "Feature" as const,
      properties: { slug: r.slug, name: names[r.slug] ?? r.slug },
      geometry: { type: "Point" as const, coordinates: getAreaCentroid(r.areaPolygon) },
    })),
  };
}

export function ResortMap({
  onSelect,
  selectedSlug,
  names = {},
}: {
  onSelect?: (slug: string) => void;
  selectedSlug?: string | null;
  /** slug -> 当前界面语言下的雪场名称，用于地图标注 */
  names?: Record<string, string>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // 初始化地图 设置
    const map = new MLMap({
      container: containerRef.current,
      style: getMapStyleUrl(),
      center: [138.815, 36.90],//经度，维度
      zoom: 10.7,//缩放
      pitch: 0,//倾斜角度
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    map.on("error", (e) => {
      console.error("MapLibre error:", e);
    });

    map.on("load", () => {
      map.resize();
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
        paint: {
          "fill-color": "#2e7dd1",
          "fill-opacity": [
            "case",
            ["boolean", ["feature-state", "active"], false],
            0.45,
            0.16,
          ],
        },
      });

      map.addLayer({
        id: "resort-outline",
        type: "line",
        source: "resort-areas",
        paint: {
          "line-color": "#2e7dd1",
          "line-width": [
            "case",
            ["boolean", ["feature-state", "active"], false],
            2.4,
            1.2,
          ],
          "line-opacity": 0.85,
        },
      });

      map.addLayer({
        id: "resort-label",
        type: "symbol",
        source: "resort-points",
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

      let activeFeatureId: string | number | undefined;

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

      void activeFeatureId;
    });

    return () => {
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

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-[28px] overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
