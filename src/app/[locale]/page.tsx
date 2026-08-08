import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HomeHero } from "@/components/HomeHero";
import { GlassCard } from "@/components/GlassCard";
import { SnowDivider } from "@/components/SnowDivider";
import { getLocalizedNews } from "@/lib/getLocalizedNews";

export default async function Home() {
  const [t, news] = await Promise.all([
    getTranslations("home"),
    getLocalizedNews(),
  ]);
  const latestNews = news.slice(0, 3);

  return (
    <div className="px-4 sm:px-8">
      {/* Hero 模块：带交互地图、右上角避让按钮以及右侧雪场详情抽屉 */}
      <HomeHero />

      {/* 最新消息 */}
      <section className="mx-auto max-w-[1040px] px-8 mb-12">
        <SnowDivider label={t("news")} />
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">{t("newsTitle")}</h2>
          </div>
          <Link
            href="/news"
            className="text-sm font-medium text-accent-ice transition-colors hover:text-[color:var(--accent-frost)]"
          >
            {t("newsViewAll")}
          </Link>
        </div>

        <div className="mt-8 grid gap-6">
          {latestNews.map((item) => (
            <GlassCard key={item.slug} className="p-6 h-full">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-accent-ice/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-accent-ice">
                  {item.categoryLabel}
                </span>
                <span className="font-data text-[11px] text-ink-faint">{item.publishedAt}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">{item.excerpt}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* 功能三件套 */}
      <section className="mt-12 sm:mt-16">
        <SnowDivider label={t("howItWorks")} />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard
            index={t("feature1Index")}
            title={t("feature1Title")}
            desc={t("feature1Desc")}
          />
          <FeatureCard
            index={t("feature2Index")}
            title={t("feature2Title")}
            desc={t("feature2Desc")}
          />
          <FeatureCard
            index={t("feature3Index")}
            title={t("feature3Title")}
            desc={t("feature3Desc")}
          />
        </div>
      </section>

      {/* 精选对比预览 */}
      {/* <section className="mt-24 mb-12">
        <SnowDivider label={t("featured")} />
        <div className="mt-10 flex items-end justify-between">
          <h2 className="text-2xl font-black tracking-tight">{t("featuredTitle")}</h2>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6">
          {featured.map((r) => (
            <Link key={r.slug} href={`/resorts/${r.slug}`}>
              <GlassCard className="p-6 h-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-ink-faint">{r.region}</span>
                  <span className="font-data text-xs text-accent-ice">
                    ¥{r.basePrice.toLocaleString()}〜
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold">{r.name}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted line-clamp-2">
                  {r.summary}
                </p>
                <div className="mt-5 flex items-center gap-3 text-xs text-ink-muted">
                  <span className="font-data">
                    {r.travel.shinkansenMin || r.travel.carMin} {t("minutes")}
                  </span>
                  <span>·</span>
                  <span className="font-data">
                    {r.courses.total} {t("courses")}
                  </span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section> */}
    </div>
  );
}

function FeatureCard({
  index,
  title,
  desc,
}: {
  index: string;
  title: string;
  desc: string;
}) {
  return (
    <GlassCard className="p-7">
      <span className="font-data text-[11px] tracking-[0.2em] uppercase text-accent-ice">
        {index}
      </span>
      <h3 className="mt-3 text-[17px] font-bold">{title}</h3>
      <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-muted">{desc}</p>
    </GlassCard>
  );
}
