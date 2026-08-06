import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "ja", "en"],
  defaultLocale: "zh",
  // 默认语言(中文)不带前缀路径，日文/英文带 /ja /en 前缀
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const localeLabels: Record<Locale, string> = {
  zh: "简体中文",
  ja: "日本語",
  en: "English",
};
