"use client";

import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import clsx from "clsx";

const SHORT_LABEL: Record<string, string> = {
  zh: "中",
  ja: "日",
  en: "EN",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <div className="ml-1 flex items-center gap-0.5 rounded-full bg-white/50 p-1">
      {routing.locales.map((l) => (
        <button
          key={l}
          onClick={() =>
            router.replace(
              // @ts-expect-error pathname/params 类型由 next-intl 依据实际路由生成，这里做通用切换
              { pathname, params },
              { locale: l }
            )
          }
          className={clsx(
            "w-8 h-8 rounded-full text-xs font-medium font-data transition-colors",
            l === locale
              ? "bg-accent-ice text-white"
              : "text-ink-muted hover:bg-white/80"
          )}
          aria-current={l === locale}
        >
          {SHORT_LABEL[l]}
        </button>
      ))}
    </div>
  );
}
