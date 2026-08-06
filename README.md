# 雪匹 SnowMatch

日本雪场地图化横向对比工具（MVP：东京日归雪场专题）。

当前是**前端模板阶段**：所有雪场数据来自 `src/lib/resorts.ts` 的假数据，
地图区域轮廓、交通时间/票价均为占位数据，UGC 模块只搭了UI壳子，尚未接后端。

## 本地运行

```bash
npm install
cp .env.local.example .env.local   # 按需填入 MapTiler key，不填也能跑（自动回退 OpenFreeMap）
npm run dev
```

打开 http://localhost:3000

## 目录结构

```
src/
  app/
    [locale]/
      page.tsx              首页（地图Hero + 功能入口 + 精选雪场）
      layout.tsx             语言相关的根布局（html lang、字体切换、Provider）
      map/page.tsx           地图页（列表 + 地图 + 详情侧栏三栏布局）
      compare/page.tsx        横向对比页（多选 + 并排卡片）
      resorts/[slug]/page.tsx 雪场详情页
    globals.css              设计token、毛玻璃/结霜工具类、按语言切换字体
  components/
    ResortMap.tsx           MapLibre地图组件，含雪场区块图层（标注文字接受外部传入的本地化名称）
    Navbar.tsx / Footer.tsx  服务端组件，通过 getTranslations 取文案
    LocaleSwitcher.tsx       语言切换器，切换时保留当前页面路径
    GlassCard.tsx            通用毛玻璃卡片
    DifficultyMark.tsx       雪道难度标记（圆/方/菱形），全站信息可视化语言；文字由外部传入以支持多语言
    SnowDivider.tsx          雪晶分隔符（章节间的签名装饰元素）
  lib/
    types.ts                 Resort（结构化数据）与 ResortText（多语言文本）类型定义
    resorts.ts                结构化假数据（价格/坐标/雪道数等，不含文本）
    getLocalizedResorts.ts     服务端组件用：合并 resorts.ts 与当前语言的文本翻译
    useLocalizedResorts.ts     客户端组件用：同上，基于 useTranslations
    mapStyle.ts                地图底图样式来源（MapTiler / OpenFreeMap 回退）
  i18n/
    routing.ts               支持的语言列表（zh/ja/en）与路由前缀策略
    navigation.ts             locale-aware 的 Link / useRouter / usePathname
    request.ts                根据当前语言加载对应的 messages/*.json
  middleware.ts              语言检测与路由重写
messages/
  zh.json / ja.json / en.json   全站UI文案 + 每个雪场的 name/region/summary/tags 翻译
```

## 多语言架构说明

用的是 `next-intl`，路由策略是 `as-needed`：中文（默认语言）路径不带前缀（`/map`），日文/英文带前缀（`/ja/map`、`/en/map`）。这样做的考虑是主要受众是中文雪友，根路径保持简洁对SEO更友好，同时保留完整的日/英文版本。

**文案怎么改**：所有界面文案在 `messages/{locale}.json` 里，按 `nav` / `home` / `map` / `compare` / `detail` / `footer` / `difficulty` 分了命名空间，改文案不用碰组件代码。

**雪场数据怎么加**：一座雪场需要同时改两个地方——`src/lib/resorts.ts` 里加结构化数据（价格、坐标、雪道数等，与语言无关），`messages/{locale}.json` 的 `resorts` 命名空间下用同一个 `slug` 加三份文本翻译（name/region/summary/tags）。两边靠 slug 对应，漏填某个语言的翻译在开发环境会直接报错提示缺 key，不会静默显示空白。

**接 Supabase 时的调整**：现在 `getLocalizedResorts.ts` / `useLocalizedResorts.ts` 是把 `resorts.ts` 的静态数组和 messages 的翻译在前端合并。接入数据库后，更合理的做法是把多语言文本也存进 Supabase（比如 `resort_translations` 表，字段 `resort_id / locale / name / region / summary / tags`），查询时按当前 `locale` 过滤，不再依赖 messages.json 存雪场文本（UI文案本身继续留在 messages.json 里就行，那部分不需要进数据库）。

## 已知的一个警告

`npm run build` 时会看到一条 `middleware 已废弃，请使用 proxy` 的提示——这是 Next.js 16 的新约定，`next-intl` 目前的中间件写法还是基于 `middleware.ts`，功能完全正常，只是个提示，等 `next-intl` 更新适配后可以再切换。

## 后续接入真实数据时要做的事

1. **雪场区域轮廓**：`resorts.ts` 里的 `areaPolygon` 现在是用中心点自动生成的粗略多边形，
   需要在 [geojson.io](https://geojson.io) 上对照卫星图逐个雪场手绘真实边界，替换掉 `mockArea()` 的产出。
2. **接交通数据**：`travel` 字段目前是手填的示例数字。按照之前讨论的方案，
   出发地固定东京站时不必接实时交通API，维护一张静态表即可（新干线时间/票价 + 自驾时间/距离/过路费）。
3. **接 Supabase**：把 `resorts.ts` 的静态数组换成从 Supabase 拉数据，建表字段直接参考 `types.ts` 的 `Resort` 接口。
4. **UGC 匿名提交**：详情页底部"今日现场反馈"区块目前只是静态壳子。接入时：
   - 结构化反馈（如箱型缆车开放状态）走 Supabase Edge Function，按 IP 做每日限流
   - 展示时用"近7天N人反馈，X%说开放"的聚合方式弱化单条错误数据的影响
   - 自由文本反馈（雪质描述等）先不开放，等结构化反馈跑通后再加
5. **天气**：接入 Open-Meteo，免费无需 key，可在雪场详情页加一个天气卡片。
6. **地图底图**：换上正式的 MapTiler key 后，可以在 [MapTiler Style Editor](https://cloud.maptiler.com/maps/) 里
   进一步精简 POI 密度、调整配色，让底图更"退到背景"，突出雪场色块。

## 关于响应式

当前版本只做 PC 端（`min-width: 1180px`），未做移动端适配 —— 横向对比表格在手机上体验很差，
后续如果要做移动端，建议对比页单独设计一套（比如改成上下滑动切换单卡对比），而不是直接压缩桌面布局。
