/**
 * 地图底图样式来源
 *
* 默认优先使用 MapTiler 的 Terrain Winter 样式，适合雪场地图展示。
 * 前往 https://cloud.maptiler.com/ 注册免费账号获取 key 后，写入 .env.local:
 *   NEXT_PUBLIC_MAPTILER_KEY=你的key
 *
 * 未配置 key 时，自动回退到 OpenFreeMap 的 Positron 样式（免费可用）。
 */
 export function getMapStyleUrl(): string {
   const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
   if (key) {
     return `https://api.maptiler.com/maps/winter/style.json?key=${key}`;
  }
  return "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
}
