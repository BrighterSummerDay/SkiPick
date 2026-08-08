import { getTranslations } from "next-intl/server";

const EDITION_URL = "https://xiaotouming-site.ydm1996.workers.dev/";

export async function Footer() {
  const t = await getTranslations("footer");
  return (
    <footer className="shrink-0 h-10 border-t border-white/60 bg-[var(--bg)]/80 backdrop-blur-md z-40">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 h-full flex items-center justify-between text-xs text-ink-faint">
        <span>{t("note")}</span>
        <a
          href={EDITION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-data text-current"
        >
          {t("edition")}
        </a>
      </div>
    </footer>
  );
}
