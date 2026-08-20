# SkiPick (日本雪场地图化横向对比决策平台)

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre_GL-v6-396afc?logo=maplibre)](https://maplibre.org/)

> **一张地图，看懂东京周边及日本主要雪场。**  
> 地图上直接圈出雪场真实轮廓，横向并排对比雪票价格、雪道结构比例、缆车配置、新干线与自驾交通耗时费用，把决定的时间还给滑雪本身。

---

## 核心特性

- **矢量地形与雪场轮廓定位**：基于 MapLibre GL 与真实地形底图，高亮圈出雪场边界范围与相邻雪场位置关系，支持按大区域（越后汤泽、群马栃木、长野白马等）一键穿梭聚合。
- **多雪场深度横向对比**：支持同时选定 2~4 座雪场，并排对比单日票、季票、雪道难度分布条（初/中/高级百分比）、箱型缆车数量、山顶/山脚海拔落差、新干线直达耗时票价与自驾路程费用。
- **Open-Meteo 实时气象与高程落差**：基于经纬度实时获取山顶实测温度、体感温度、每小时降雪量（cm/h）、风速与天气状况。
- **全站多语言（i18n）**：基于 `next-intl` 实现中文（简体）、日语、英语无缝切换，汉字字形深度优化。
- **雪友现场反馈与社区互动**：全栈接入 Supabase 数据库（附带本地内存无缝降级），支持基于 SHA-256 IP 的 5 分钟频控防刷与管理员回复机制。
- **高性能边缘就绪架构**：
  - **数据分层解耦**：基础元数据与高精度地理轮廓（`resort-polygons.ts`）解耦，常规页面包体积锐减 **77%**；
  - **动态按需加载**：重型地图组件配合磨砂冰雪质感骨架屏（`MapSkeleton`）异步加载；
  - **SSG 预渲染**：227 个静态路由全量预渲染，首屏毫秒级加载。

---

## 目录结构

```
├── messages/                  # 多语言文案字典
│   ├── zh.json                # 中文（简体）
│   ├── ja.json                # 日语
│   └── en.json                # 英语
├── public/                    # 静态资源与 MapLibre Worker
│   └── osm/                   # 各雪场 OSM 雪道与缆车精细数据
├── src/
│   ├── app/
│   │   ├── [locale]/          # 国际化动态路由
│   │   │   ├── page.tsx       # 首页（Hero 地图、特性介绍、最新动态）
│   │   │   ├── layout.tsx     # 全局根布局（字体、导航、页脚、SEO）
│   │   │   ├── map/           # 雪场地图探索页
│   │   │   ├── compare/       # 雪场参数横向对比页
│   │   │   ├── resorts/       # 雪场全景一览与卡片列表
│   │   │   │   └── [slug]/    # 单个雪场详情页（实时天气、交通、设施）
│   │   │   ├── news/          # 更新公告与更新日志
│   │   │   └── feedback/      # 社区与意见反馈页
│   │   ├── api/
│   │   │   └── feedback/      # 反馈留言 GET/POST/PATCH 接口
│   │   └── globals.css        # 全局设计系统与磨砂玻璃/结霜动效 CSS
│   ├── components/            # UI 组件库
│   │   ├── HomeHero.tsx       # 首页 Hero 交互卡片与地图
│   │   ├── ResortMap.tsx      # MapLibre 交互地图与图层控制核心组件
│   │   ├── MapSkeleton.tsx    # 地图专属冰雪磨砂微光骨架屏
│   │   ├── ResortList.tsx     # 雪场一览高级筛选与排序面板
│   │   ├── ResortWeatherCard.tsx # 实时气温降雪量卡片
│   │   ├── FeedbackForm.tsx   # 用户留言提交表单
│   │   ├── FeedbackList.tsx   # 留言列表展示与分页组件
│   │   ├── DifficultyMark.tsx # 雪道难度图例与徽标
│   │   ├── GlassCard.tsx      # 通用磨砂毛玻璃卡片容器
│   │   ├── Navbar.tsx         # 顶部浮动毛玻璃导航栏
│   │   ├── Footer.tsx         # 底部信息栏
│   │   └── LocaleSwitcher.tsx # 多语言无跳转切换器
│   ├── lib/                   # 核心业务逻辑与数据层
│   │   ├── types.ts           # TypeScript 核心接口定义
│   │   ├── resorts.ts         # 68 座雪场结构化纯净元数据
│   │   ├── resort-polygons.ts # 68 座雪场高精度轮廓多边形坐标
│   │   ├── regions.ts         # 地图大区域划分与镜头视角配置
│   │   ├── compareMetrics.ts  # 对比维度配置与单元格渲染器
│   │   ├── supabase.ts        # Supabase 客户端与数据库类型
│   │   ├── getLocalizedResorts.ts # 服务端多语言雪场数据获取
│   │   ├── useLocalizedResorts.ts # 客户端多语言雪场 Hook
│   │   └── utils.ts           # 通用工具函数
│   └── i18n/                  # 国际化路由配置 (next-intl)
├── scripts/                   # 辅助抓取与数据处理脚本
│   ├── fetch-osm-data.mjs     # Overpass API 雪道与高程抓取
│   └── update_travel.mjs      # 交通耗时批量更新工具
├── open-next.config.ts        # Cloudflare OpenNext 部署配置
└── wrangler.jsonc             # Cloudflare Workers / Pages 配置
```

---

## 技术栈

| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/) | 极致性能与全静态预渲染 (SSG) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Vanilla CSS Tokens | 冰雪磨砂质感设计系统 (Glassmorphism) |
| **Map Engine** | [MapLibre GL](https://maplibre.org/) | 高性能矢量底图与 GeoJSON 多边形渲染 |
| **Internationalization** | [next-intl](https://next-intl-docs.vercel.app/) | 支持中/日/英多语言路由与实时切换 |
| **Weather API** | [Open-Meteo](https://open-meteo.com/) | 免费免 Key 的高精度实时山地气象数据 |
| **Backend & Database** | [Supabase (PostgreSQL)](https://supabase.com/) | 留言数据存储，内置内存级本地降级 |
| **Deployment** | [Cloudflare Workers](https://workers.cloudflare.com/) / [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) | 边缘节点全球极速分发 |

---

## 本地开发指南

### 1. 安装依赖

推荐使用 Node.js 22：

```bash
npm install
```

> **提示**：安装依赖时会自动执行 `postinstall` 脚本，将 `maplibre-gl-worker.mjs` 等必要资源同步复制到 `public/` 目录下。

### 2. 启动本地开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 即可查看效果。

### 3. 代码检查与类型校验

```bash
# 执行 TypeScript 类型检查
npx tsc --noEmit

# 执行 ESLint 代码规范检查
npm run lint
```

### 4. 生产打包构建

```bash
# Next.js 标准生产打包
npm run build

# Cloudflare OpenNext 边缘打包
npm run build:cf
```

---

## 数据来源与说明

1. **地图底图**：采用 MapTiler 矢量冬季雪场主题样式。
2. **雪场区域轮廓**：基于卫星地图与官网雪道图逐个精确测绘，独立存储于 `resort-polygons.ts`。
3. **交通数据**：以东京站为基准点，汇总新干线最短接驳耗时、自由席票价，以及自驾高速里程和普通 ETC 过路费。
4. **实时天气**：由客户端直接请求 Open-Meteo API，无需服务器额外部署中转代理。
