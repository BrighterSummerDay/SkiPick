"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/GlassCard";
import type { FeedbackRecord } from "@/lib/supabase";

export function FeedbackList({ refreshTrigger }: { refreshTrigger: number }) {
  const t = useTranslations("feedbackPage");
  const [items, setItems] = useState<FeedbackRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/feedback?page=${page}&pageSize=10`);
        const data = await res.json();
        if (res.ok && !ignore) {
          setItems(data.items || []);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.totalCount || 0);
          setIsConfigured(data.isConfigured ?? true);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch feedbacks:", err);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [page, refreshTrigger]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 头部标题与统计 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink-main">
            {t("listTitle")}
          </h2>
          <p className="mt-1 text-xs text-ink-faint">
            {t("pageInfo", { page, totalPages, totalCount })}
          </p>
        </div>
      </div>

      {/* Supabase 未配置时的演示模式提示 */}
      {!isConfigured && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
          {t("demoNotice")}
        </div>
      )}

      {/* 留言列表 */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-accent-ice/20 border-t-accent-ice animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <GlassCard className="p-8 text-center text-ink-muted text-sm">
          {t("empty")}
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <GlassCard key={item.id} className="p-5 sm:p-6 w-full space-y-4">
              {/* 用户信息与留言时间 */}
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent-ice/15 border border-accent-ice/30 flex items-center justify-center text-accent-ice text-xs font-bold">
                    {item.nickname.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-ink-main">{item.nickname}</span>
                </div>
                <span className="font-data text-[11px] text-ink-faint">
                  {formatDate(item.created_at)}
                </span>
              </div>

              {/* 留言正文 */}
              <p className="text-sm leading-relaxed text-ink-muted whitespace-pre-line">
                {item.content}
              </p>

              {/* 站长回复（由管理员在 Supabase 中填写后自动展示） */}
              {item.admin_reply && (
                <div className="mt-4 pt-4 border-t border-accent-ice/20 bg-accent-ice/5 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-ice/20 text-accent-ice text-[11px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-ice animate-pulse" />
                      {t("adminBadge")}
                    </span>
                    {item.replied_at && (
                      <span className="font-data text-[10px] text-ink-faint">
                        {formatDate(item.replied_at)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed text-ink-main whitespace-pre-line pl-1">
                    {item.admin_reply}
                  </p>
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* 分页控制器 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 select-none">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 py-2 rounded-full border border-white/15 text-xs font-medium text-ink-muted hover:text-ink hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            ← {t("prevPage")}
          </button>

          <span className="font-data text-xs text-ink-faint">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 py-2 rounded-full border border-white/15 text-xs font-medium text-ink-muted hover:text-ink hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            {t("nextPage")} →
          </button>
        </div>
      )}
    </div>
  );
}
