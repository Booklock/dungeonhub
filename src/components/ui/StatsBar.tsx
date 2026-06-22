"use client";

interface StatsBarProps {
  value: number;
  max: number;
  type?: "hp" | "xp";
  showNumbers?: boolean;
}

export function StatsBar({ value, max, type = "hp", showNumbers = true }: StatsBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const fillClass =
    type === "xp"
      ? "xp-bar-fill"
      : pct > 50
      ? "hp-bar-fill"
      : pct > 25
      ? "hp-bar-fill medium"
      : "hp-bar-fill low";

  return (
    <div>
      <div className={type === "hp" ? "hp-bar" : "xp-bar"}>
        <div className={fillClass} style={{ width: `${pct}%` }} />
      </div>
      {showNumbers && (
        <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)", marginTop: 2, textAlign: "right" }}>
          {value} / {max}
        </div>
      )}
    </div>
  );
}
