import { ReactNode } from "react";
import clsx from "clsx";

export function GlassCard({
  children,
  className,
  strong,
  frost = true,
  id,
}: {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  frost?: boolean;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={clsx(
        strong ? "glass-strong" : "glass",
        "rounded-2xl",
        frost && "frost-ring",
        className
      )}
    >
      {children}
    </div>
  );
}
