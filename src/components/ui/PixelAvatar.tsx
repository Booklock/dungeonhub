"use client";

const CLASS_COLORS: Record<string, string[]> = {
  fighter: ["#ef4444", "#b91c1c"],
  barbarian: ["#f97316", "#c2410c"],
  paladin: ["#fbbf24", "#d97706"],
  rogue: ["#6b7280", "#374151"],
  ranger: ["#10b981", "#065f46"],
  druid: ["#84cc16", "#3f6212"],
  wizard: ["#8b5cf6", "#5b21b6"],
  sorcerer: ["#ec4899", "#9d174d"],
  warlock: ["#7c3aed", "#4c1d95"],
  bard: ["#14b8a6", "#0f766e"],
  cleric: ["#f59e0b", "#92400e"],
  monk: ["#06b6d4", "#155e75"],
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getColors(seed: string, charClass: string): [string, string] {
  const key = charClass.toLowerCase();
  if (CLASS_COLORS[key]) return CLASS_COLORS[key] as [string, string];
  const keys = Object.keys(CLASS_COLORS);
  const idx = hashCode(seed) % keys.length;
  return CLASS_COLORS[keys[idx]] as [string, string];
}

const PIXEL_PATTERNS = [
  // Pattern 0: Knight
  [
    "00111100",
    "01111110",
    "01111110",
    "00111100",
    "01111110",
    "11111111",
    "11111111",
    "01100110",
  ],
  // Pattern 1: Mage
  [
    "00111100",
    "01111110",
    "01111110",
    "00111100",
    "00111100",
    "01111110",
    "01100110",
    "11100111",
  ],
  // Pattern 2: Rogue
  [
    "00111100",
    "01111110",
    "01111110",
    "00111100",
    "00011100",
    "00111110",
    "01100110",
    "00110000",
  ],
];

interface PixelAvatarProps {
  seed: string;
  charClass?: string;
  size?: number;
}

export function PixelAvatar({ seed, charClass = "fighter", size = 48 }: PixelAvatarProps) {
  const [primary, secondary] = getColors(seed, charClass);
  const pattern = PIXEL_PATTERNS[hashCode(seed) % PIXEL_PATTERNS.length];
  const pixelSize = size / 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ imageRendering: "pixelated" }}
    >
      {pattern.map((row, y) =>
        row.split("").map((cell, x) =>
          cell === "1" ? (
            <rect
              key={`${x}-${y}`}
              x={x * pixelSize}
              y={y * pixelSize}
              width={pixelSize}
              height={pixelSize}
              fill={x % 2 === 0 ? primary : secondary}
            />
          ) : null
        )
      )}
    </svg>
  );
}
