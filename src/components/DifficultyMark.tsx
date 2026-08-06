import { Difficulty } from "@/lib/types";

const COLORS: Record<Difficulty, string> = {
  beginner: "var(--piste-green)",
  intermediate: "var(--piste-red)",
  advanced: "var(--piste-black)",
};

export function DifficultyMark({
  level,
  size = 10,
}: {
  level: Difficulty;
  size?: number;
}) {
  const color = COLORS[level];
  if (level === "beginner") {
    return (
      <span
        className="inline-block rounded-full"
        style={{ width: size, height: size, background: color }}
      />
    );
  }
  if (level === "intermediate") {
    return (
      <span
        className="inline-block"
        style={{ width: size, height: size, background: color }}
      />
    );
  }
  return (
    <span
      className="inline-block"
      style={{
        width: size,
        height: size,
        background: color,
        transform: "rotate(45deg)",
      }}
    />
  );
}

export function DifficultyLegend({
  labels,
}: {
  labels: Record<Difficulty, string>;
}) {
  const items: Difficulty[] = ["beginner", "intermediate", "advanced"];
  return (
    <div className="flex items-center gap-4 text-xs text-ink-muted">
      {items.map((level) => (
        <div key={level} className="flex items-center gap-1.5">
          <DifficultyMark level={level} />
          <span>{labels[level]}</span>
        </div>
      ))}
    </div>
  );
}
