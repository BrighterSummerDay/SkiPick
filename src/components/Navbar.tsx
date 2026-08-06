import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./LocaleSwitcher";

export async function Navbar() {
  const t = await getTranslations("nav");

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-[1040px] px-8 pt-5">
        <div className="glass-strong rounded-2xl px-6 h-16 flex items-center justify-between shadow-[0_10px_40px_-20px_rgba(30,91,163,0.35)]">

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
              {t("brand")}
            </span>
          </Link>

          {/* ── 分隔线 ────────────────────────────── */}
          <div className="w-px h-5 bg-white/30 mx-4 shrink-0" />

          {/* ── 导航项（靠左） ───────────────────── */}
          <nav className="flex items-center gap-0.5 flex-1">
            <Link
              href="/map"
              className="group relative px-4 py-2 rounded-full text-sm font-medium text-ink-muted transition-all duration-200 hover:text-ink"
            >
              {/* hover 背景填充 */}
              <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/60 transition-all duration-200" />
              {/* hover 底部线条 */}
              <span className="absolute bottom-1 left-4 right-4 h-[1.5px] rounded-full bg-accent-ice scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              <span className="relative">{t("map")}</span>
            </Link>

            <Link
              href="/compare"
              className="group relative px-4 py-2 rounded-full text-sm font-medium text-ink-muted transition-all duration-200 hover:text-ink"
            >
              <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/60 transition-all duration-200" />
              <span className="absolute bottom-1 left-4 right-4 h-[1.5px] rounded-full bg-accent-ice scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              <span className="relative">{t("compare")}</span>
            </Link>

            <Link
              href="/resorts"
              className="group relative px-4 py-2 rounded-full text-sm font-medium text-ink-muted transition-all duration-200 hover:text-ink"
            >
              <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/60 transition-all duration-200" />
              <span className="absolute bottom-1 left-4 right-4 h-[1.5px] rounded-full bg-accent-ice scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              <span className="relative">{t("resorts")}</span>
            </Link>

            <Link
              href="/news"
              className="group relative px-4 py-2 rounded-full text-sm font-medium text-ink-muted transition-all duration-200 hover:text-ink"
            >
              <span className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/60 transition-all duration-200" />
              <span className="absolute bottom-1 left-4 right-4 h-[1.5px] rounded-full bg-accent-ice scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              <span className="relative">{t("news")}</span>
            </Link>

            {/* 更多功能 — 不可点击 */}
            {/* <span className="group relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-ink-faint cursor-not-allowed select-none">
              <span className="relative">{t("comingSoon")}</span>
            </span> */}
          </nav>

          {/* ── 语言切换（靠右） ─────────────────── */}
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
