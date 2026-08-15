# SkiPick

日本雪场地图化横向对比网站。

当前是**前端模板阶段**：雪场数据整理核实中，请以官网数据为准。
地图区域轮廓、交通时间/票价等信息均保存在项目文档中，未接后端数据库。

## 目录结构

```
src/
  app/
    [locale]/
      page.tsx               首页
      layout.tsx             语言相关的根布局
      map/page.tsx           地图页
      news/page.tsx          公告页
      feedback/page.tsx      意见反馈页
      compare/page.tsx       横向对比页
      resorts//page.tsx      雪场详情页
    globals.css              全局css配置
  components/
    HomeHero.tsx             首页本体Hero组件
    ResortMap.tsx            MapLibre地图组件
    ResortWeatherCard.tsx    雪场详情页面实时天气卡片
    Navbar.tsx / Footer.tsx  服务端组件
    LocaleSwitcher.tsx       语言切换器，切换时保留当前页面路径
    GlassCard.tsx            通用毛玻璃卡片
    DifficultyMark.tsx       雪道难度标记
    SnowDivider.tsx          章节间的签名装饰元素
  lib/
    types.ts                 Resort（结构化数据）与 ResortText（多语言文本）类型定义
    getLocalizedResorts.ts   服务端组件用
    getLocalizedNews.ts      公告页服务端组件用
    useLocalizedResorts.ts   客户端组件用
    mapStyle.ts              地图底图样式来源
    resorts.ts               各个雪场的结构化数据
    resorts-content.ts       雪场地图页面 选中各个雪场后展示的详细内容
    news.ts                  各雪场的更新公告
    regions.ts               雪场所在大区域数据
    utils.ts                 公用函数规范，时分格式转化
  i18n/
    routing.ts               支持的语言列表（zh/ja/en）与路由前缀策略
    navigation.ts            locale-aware 的 Link / useRouter / usePathname
    request.ts               根据当前语言加载对应的 messages/*.json
  middleware.ts              语言检测与路由重写
messages/
  zh/ja/en.json              各语言对应全站文案
```

## 数据来源

1. **地图底图**：使用了[MapTiler](https://cloud.maptiler.com/)提供的冬季地图样式。
2. **雪场区域轮廓**：对照地图和雪场官网地图，逐个雪场手动绘制。
3. **交通数据**：目前出发地固定东京站。未接入实时交通API，静态数据维护在`resorts.ts`。日后可根据需要接入实时交通API。
4. **匿名提交功能（开发中）**：详情页底部"今日现场反馈"区块目前开发中。
  后续计划：
   - 箱车开放状态，雪质描述等信息，匿名反馈，按 IP 做每日限流
   - 展示时用【点赞数】【不准确】来进行sort权重，不准确的评论会折叠，以弱化单条错误数据的影响
5. **天气**：接入了[Open-Meteo](https://open-meteo.com/)的免费天气API，天气数据由用户浏览器请求，无需服务器额外维护。

## 关于适配

当前版本只做 PC 端，未做移动端适配 —— 因为横向对比表格在手机上体验很差。
后续做移动端适配（如果有）时，会单独设计一套对比交互。
