"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { resorts } from "@/lib/resorts";

export function Navbar() {
  const tNav = useTranslations("nav");
  const tMap = useTranslations("map");
  const tCompare = useTranslations("compare");
  const tResorts = useTranslations("resortsPage");
  const tNews = useTranslations("news");
  const tFeedback = useTranslations("feedbackPage");
  const pathname = usePathname();

  const navItems = [
    {
      href: "/map",
      label: tNav("map"),
      subtitle: tMap("subtitle"),
      isActive: pathname.startsWith("/map"),
    },
    {
      href: "/compare",
      label: tNav("compare"),
      subtitle: tCompare("subtitle", { max: 4 }),
      isActive: pathname.startsWith("/compare"),
    },
    {
      href: "/resorts",
      label: tNav("resorts"),
      subtitle: tResorts("subtitle", { count: resorts.length }),
      isActive: pathname.startsWith("/resorts"),
    },
    {
      href: "/news",
      label: tNav("news"),
      subtitle: tNews("pageSubtitle"),
      isActive: pathname.startsWith("/news"),
    },
    {
      href: "/feedback",
      label: tNav("feedback"),
      subtitle: tFeedback("pageSubtitle"),
      isActive: pathname.startsWith("/feedback"),
    },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-[1100px] w-full px-4 sm:px-8 pt-3">
        <div className="glass-strong rounded-2xl px-4 sm:px-6 h-14 flex items-center justify-between shadow-[0_10px_40px_-20px_rgba(30,91,163,0.35)]">

          {/* ── Logo ──────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0">
              <g stroke="var(--accent-ice)" strokeWidth="1.6" strokeLinecap="round">
                <line x1="12" y1="2" x2="12" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </g>
            </svg>
            <span className="text-[17px] font-bold tracking-tight">
              {tNav("brand")}
            </span>
          </Link>

          {/* ── 分隔线 ────────────────────────────── */}
          <div className="w-px h-5 bg-white/30 mx-4 shrink-0" />

          {/* ── 导航项（靠左） ───────────────────── */}
          <nav className="flex items-center gap-1 sm:gap-1.5 flex-1">
            {navItems.map((item) => (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${item.isActive
                    ? "text-accent-ice font-bold bg-white/80 shadow-sm"
                    : "text-ink-muted hover:text-ink"
                    }`}
                >
                  {/* hover / active 背景填充 */}
                  <span
                    className={`absolute inset-0 rounded-full transition-all duration-200 ${item.isActive
                      ? "bg-white/80"
                      : "bg-white/0 group-hover:bg-white/60"
                      }`}
                  />
                  {/* hover / active 底部线条 */}
                  <span
                    className={`absolute bottom-1 left-3.5 right-3.5 sm:left-4 sm:right-4 h-[2px] rounded-full bg-accent-ice transition-transform duration-200 origin-left ${item.isActive
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                      }`}
                  />
                  <span className="relative z-10 flex items-center gap-1">
                    {item.isActive && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent-ice animate-pulse" />
                    )}
                    {item.label}
                  </span>
                </Link>

                {/* ── Hover 悬停说明 Popover Tooltip ─────────────────── */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 w-max max-w-[260px] sm:max-w-[320px]">
                  <div className="glass-strong rounded-xl px-3.5 py-2 text-xs leading-relaxed text-ink-muted shadow-xl border border-white/70 text-center whitespace-pre-line">
                    {item.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          {/* ── 语言切换（靠右） ─────────────────── */}
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
