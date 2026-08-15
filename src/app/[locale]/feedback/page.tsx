"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SnowDivider } from "@/components/SnowDivider";
import { GlassCard } from "@/components/GlassCard";
import { FeedbackForm } from "@/components/FeedbackForm";
import { FeedbackList } from "@/components/FeedbackList";

export default function FeedbackPage() {
  const t = useTranslations("feedbackPage");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="mx-auto max-w-[1040px] w-full px-4 sm:px-8 pt-5 sm:pt-8 mb-12 sm:mb-16 space-y-8 sm:space-y-10">

      {/* 联系站长 标题 */}
      <div className="space-y-3">
        <SnowDivider label={t("contactTitle")} />
      </div>

      {/* 联系站长卡片 */}
      <GlassCard className="p-6 sm:p-8 w-full border border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <svg
                className="w-5 h-5 text-accent-ice shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <h2 className="text-lg sm:text-xl font-bold text-ink-main">
                {t("contactTitle")}
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-ink-muted">
              {t("contactDesc")}
            </p>
          </div>

          <a
            href="mailto:xiaotouming1996@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors shrink-0 w-fit cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>xiaotouming1996@gmail.com</span>
          </a>
        </div>
      </GlassCard>

      {/* 意见与反馈 标题 */}
      <div className="space-y-3">
        <SnowDivider label={t("pageTitle")} />
      </div>

      {/* 提交表单区 */}
      <FeedbackForm onSuccess={handleSuccess} />

      {/* 留言列表区 */}
      <div className="pt-4 border-t border-white/10">
        <FeedbackList refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
