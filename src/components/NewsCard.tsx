"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/GlassCard";
import type { LocalizedNewsItem } from "@/lib/getLocalizedNews";

export function NewsCard({ item }: { item: LocalizedNewsItem }) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("news");

  const handleCardClick = () => {
    if (!expanded) {
      setExpanded(true);
    }
  };

  const handleCollapseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!expanded && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setExpanded(true);
    }
  };

  return (
    <GlassCard
      className={`p-6 sm:p-8 h-full w-full transition-all duration-200 ${
        !expanded ? "cursor-pointer hover:opacity-90" : ""
      }`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={!expanded ? 0 : undefined}
      role={!expanded ? "button" : undefined}
      aria-expanded={expanded}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <span className="rounded-full bg-accent-ice/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-accent-ice font-semibold">
          {item.categoryLabel}
        </span>
        <span className="font-data text-[11px] text-ink-faint">{item.publishedAt}</span>
      </div>

      <h2 className="mt-4 text-xl sm:text-2xl font-black tracking-tight text-ink-main">{item.title}</h2>

      <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-ink-muted whitespace-pre-line w-full">
        {item.excerpt}
      </p>

      <div
        className={`w-full overflow-hidden transition-[max-height,opacity,margin-top] duration-300 ease-in-out ${
          expanded ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
        }`}
        style={{ willChange: "max-height, opacity" }}
      >
        <div className="pt-4 border-t border-white/10 w-full flex flex-col items-start gap-4">
          <p className="text-sm sm:text-[15px] leading-relaxed text-ink-muted whitespace-pre-line w-full">
            {item.content}
          </p>

          <div className="w-full flex justify-start pt-2">
            <button
              type="button"
              onClick={handleCollapseClick}
              className="inline-flex items-center gap-1.5 text-xs text-accent-ice hover:text-accent-ice/80 font-medium cursor-pointer py-1 px-2.5 -ml-2.5 rounded-lg hover:bg-white/5 transition-all"
            >
              <span>{t("collapse")}</span>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
