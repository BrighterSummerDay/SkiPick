import { ReactNode, HTMLAttributes } from "react";
import clsx from "clsx";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  frost?: boolean;
  id?: string;
}

export function GlassCard({
  children,
  className,
  strong,
  frost = true,
  id,
  ...props
}: GlassCardProps) {
  return (
    <div
      id={id}
      className={clsx(
        strong ? "glass-strong" : "glass",
        "rounded-2xl",
        frost && "frost-ring",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
