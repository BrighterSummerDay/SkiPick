"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/GlassCard";

export function FeedbackForm({ onSuccess }: { onSuccess: () => void }) {
  const t = useTranslations("feedbackPage");
  const [nickname, setNickname] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanNickname = nickname.trim();
    const cleanContent = content.trim();

    if (!cleanNickname) {
      setErrorMsg(t("nicknameRequiredHint"));
      return;
    }

    if (!cleanContent) {
      setErrorMsg(t("contentRequiredHint"));
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: cleanNickname,
          content: cleanContent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "提交失败，请稍后重试");
      }

      setSuccessMsg(t("submitSuccess"));
      setNickname("");
      setContent("");
      onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard className="p-6 sm:p-8 w-full border border-white/20">
      <h2 className="text-xl sm:text-2xl font-bold text-ink-main mb-6 flex items-center gap-2">
        <svg className="w-6 h-6 text-accent-ice" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>{t("formTitle")}</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 昵称 */}
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            {t("nicknameLabel")} <span className="text-accent-ice/80 font-normal">{t("nicknameRequiredHint")}</span>
          </label>
          <input
            type="text"
            maxLength={30}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={t("nicknamePlaceholder")}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-accent-ice/30 text-sm text-ink-main placeholder-ink-faint focus:outline-none focus:border-accent-ice focus:ring-1 focus:ring-accent-ice transition-all"
            disabled={submitting}
          />
        </div>

        {/* 留言内容 */}
        <div>
          <label className="block text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">
            {t("contentLabel")} <span className="text-accent-ice/80 font-normal">{t("contentRequiredHint")}</span>
          </label>
          <textarea
            rows={4}
            maxLength={1000}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("contentPlaceholder")}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-accent-ice/30 text-sm text-ink-main placeholder-ink-faint focus:outline-none focus:border-accent-ice focus:ring-1 focus:ring-accent-ice transition-all resize-y"
            disabled={submitting}
          />
        </div>

        {/* 错误 / 成功 状态提示 */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* 提交按钮 */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium text-accent-ice border border-accent-ice/20 bg-white/10 hover:bg-accent-ice hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t("submitting")}</span>
              </>
            ) : (
              <span>{t("submitBtn")}</span>
            )}
          </button>
        </div>
      </form>
    </GlassCard>
  );
}
