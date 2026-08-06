"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ResortMap } from "@/components/ResortMap";
import { GlassCard } from "@/components/GlassCard";
import { useLocalizedResorts } from "@/lib/useLocalizedResorts";

export default function MapPage() {
  const t = useTranslations("map");
  const resorts = useLocalizedResorts();
  const [selected, setSelected] = useState<string | null>(resorts[0].slug);
  const activeResort = resorts.find((r) => r.slug === selected);
  const names = Object.fromEntries(resorts.map((r) => [r.slug, r.name]));
  const compareResortsQuery = activeResort ? activeResort.slug : "";

  return (
    <div className="mx-8 mb-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight">{t("title")}</h1>
        <p className="mt-1.5 text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-[280px_1fr_320px] gap-5 h-[720px]">
        {/* 雪场列表 */}
        <GlassCard className="overflow-y-auto p-3" frost={false}>
          {resorts.map((r) => (
            <button
              key={r.slug}
              onClick={() => setSelected(r.slug)}
              className={`w-full text-left px-4 py-3 rounded-xl mb-1 transition-colors ${
                selected === r.slug ? "bg-white/80" : "hover:bg-white/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{r.name}</span>
                <span className="font-data text-[11px] text-ink-faint">
                  ¥{(r.basePrice / 1000).toFixed(1)}k
                </span>
              </div>
              <span className="text-xs text-ink-faint">{r.region}</span>
            </button>
          ))}
        </GlassCard>

        {/* 地图 */}
        <div className="relative h-full w-full">
          <ResortMap selectedSlug={selected} onSelect={setSelected} names={names} />
        </div>

        {/* 详情面板 */}
        <GlassCard className="p-6 overflow-y-auto" frost={false}>
          {activeResort ? (
            <>
              <span className="text-xs text-ink-faint">{activeResort.region}</span>
              <h2 className="mt-1 text-xl font-black">{activeResort.name}</h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
                {activeResort.summary}
              </p>

              <div className="mt-6 space-y-3">
                <Stat label={t("statBasePrice")} value={`¥${activeResort.basePrice.toLocaleString()}`} />
                <Stat
                  label={t("statTravel")}
                  value={
                    activeResort.travel.shinkansenMin
                      ? t("statShinkansen", { min: activeResort.travel.shinkansenMin })
                      : t("statCar", { min: activeResort.travel.carMin })
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
                    className="px-2.5 py-1 rounded-full bg-white/60 text-[11px] text-ink-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href={`/resorts/${activeResort.slug}`}
                className="mt-6 block text-center py-2.5 rounded-full text-sm font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors"
              >
                {t("viewDetail")}
              </Link>
              <Link
                href={`/compare?resorts=${compareResortsQuery}`}
                className="mt-3 block text-center py-2.5 rounded-full text-sm font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors"
              >
                {t("compareResort")}
              </Link>
            </>
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
