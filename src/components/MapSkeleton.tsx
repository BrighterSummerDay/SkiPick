import { GlassCard } from "@/components/GlassCard";

interface MapSkeletonProps {
  className?: string;
  label?: string;
}

export function MapSkeleton({
  className = "w-full h-full min-h-[380px]",
  label = "正在初始化地形矢量底图...",
}: MapSkeletonProps) {
  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#d4e4f7]/80 via-[#e2eefa]/60 to-[#c8def2]/80 border border-white/80 shadow-inner flex items-center justify-center ${className}`}
    >
      {/* 动态网格背景模拟等高线与坐标系 */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(46, 125, 209, 0.25) 1px, transparent 1px),
            linear-gradient(to right, rgba(46, 125, 209, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(46, 125, 209, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px, 48px 48px, 48px 48px",
        }}
      />

      {/* 动态光束雷达扫描效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />

      {/* 中心半透明磨砂徽章 */}
      <GlassCard
        strong
        className="relative z-10 px-6 py-4 flex flex-col items-center gap-3 shadow-lg border border-white/90 max-w-[280px] text-center"
        frost={false}
      >
        <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-accent-ice/15 text-accent-ice">
          {/* 脉冲光圈 */}
          <div className="absolute inset-0 rounded-full bg-accent-ice/20 animate-ping opacity-60" />
          {/* 罗盘雷达图标 */}
          <svg
            className="w-5 h-5 animate-spin"
            style={{ animationDuration: "8s" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-bold text-ink tracking-wide">{label}</div>
          <div className="text-[10px] text-ink-muted font-data flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-ice animate-pulse" />
            <span>MapLibre GL Vector Engine</span>
          </div>
        </div>
      </GlassCard>

      {/* 右上角模拟地图缩放控制占位 */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 opacity-40">
        <div className="w-8 h-8 rounded-lg bg-white/70 backdrop-blur-md border border-white" />
        <div className="w-8 h-8 rounded-lg bg-white/70 backdrop-blur-md border border-white" />
      </div>
    </div>
  );
}
