/**
 * utils.ts - Travel time formatting utilities
 */

/**
 * Format total driving minutes as hours+minutes string.
 * zh: "2小时30分" | ja: "2時間30分" | en: "2h 30m"
 */
export function formatCarMin(min: number, locale: string = "zh"): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (locale === "ja") {
    if (h === 0) return `${m}分`;
    if (m === 0) return `${h}時間`;
    return `${h}時間${m}分`;
  }
  if (locale === "en") {
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
  // default: zh
  if (h === 0) return `${m}分`;
  if (m === 0) return `${h}小时`;
  return `${h}小时${m}分`;
}

export function formatShinkansenMin(min: number, locale: string = "zh"): string {
  return formatCarMin(min, locale);
}
