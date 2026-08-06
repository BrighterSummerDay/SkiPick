"use client";

import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import type { LocalizedNewsItem } from "@/lib/getLocalizedNews";

export function NewsCard({ item }: { item: LocalizedNewsItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <GlassCard className="p-6 h-full">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="text-left w-full flex flex-col items-start cursor-pointer transition duration-150 hover:opacity-90"
        aria-expanded={expanded}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-accent-ice/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-accent-ice">
            {item.categoryLabel}
          </span>
          <span className="font-data text-[11px] text-ink-faint">{item.publishedAt}</span>
        </div>

        <h2 className="mt-4 text-xl font-black tracking-tight">{item.title}</h2>

        <p className="mt-3 text-sm leading-relaxed text-ink-muted whitespace-pre-line">
          {item.excerpt}
        </p>

        <div
          className={`overflow-hidden transition-[max-height,opacity,margin-top] duration-300 ease-in-out ${
            expanded ? "max-h-[500px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
          }`}
          style={{ willChange: "max-height, opacity" }}
        >
          <p className="text-sm leading-relaxed text-ink-muted whitespace-pre-line">
            {item.content}
          </p>
        </div>
      </button>
    </GlassCard>
  );
}
