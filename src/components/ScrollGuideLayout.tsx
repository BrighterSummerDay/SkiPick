"use client";

import { useEffect, useState, useRef, ReactNode } from "react";

interface ScrollGuideLayoutProps {
  children: ReactNode;
  scrollMoreText?: string;
  reachedBottomText?: string;
}

export function ScrollGuideLayout({
  children,
  scrollMoreText = "向下滚动查看更多",
  reachedBottomText = "已经到底了",
}: ScrollGuideLayoutProps) {
  const [showScrollGuide, setShowScrollGuide] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScroll = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const clientHeight = window.innerHeight;
      const scrollHeight = doc.scrollHeight;

      // Only show if the page is scrollable and user has not reached the bottom (buffer 80px)
      const isScrollable = scrollHeight > clientHeight + 40;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 180;

      setShowScrollGuide(isScrollable && !isNearBottom);
    };

    checkScroll();
    window.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll, { passive: true });

    let observer: ResizeObserver | null = null;
    if (containerRef.current && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        checkScroll();
      });
      observer.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const handleScrollClick = () => {
    window.scrollBy({
      top: window.innerHeight * 0.6,
      behavior: "smooth",
    });
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 列表内容 */}
      {children}

      {/* 底部：已经到底了 标识 */}
      <div className="flex items-center justify-center gap-4 my-10 text-ink-faint select-none">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--accent-frost)]/30 to-transparent" />
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" className="shrink-0 text-accent-ice/70">
            <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </g>
          </svg>
          <span className="text-xs font-medium tracking-widest text-ink-faint">
            {reachedBottomText}
          </span>
        </div>
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--accent-frost)]/30 to-transparent" />
      </div>

      {/* 浮动滚动引导 */}
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${showScrollGuide
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
          }`}
      >
        <button
          type="button"
          onClick={handleScrollClick}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass-strong border border-accent-ice/30 text-accent-ice text-xs font-medium shadow-xl hover:border-accent-ice/60 hover:bg-white/10 active:scale-95 transition-all cursor-pointer group"
          aria-label={scrollMoreText}
        >
          <span>{scrollMoreText}</span>
          <svg
            className="w-4 h-4 animate-bounce group-hover:translate-y-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
