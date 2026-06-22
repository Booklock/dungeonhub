"use client";

import Link from "next/link";
import type { User } from "next-auth";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { StatsBar } from "@/components/ui/StatsBar";

interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  xp: number;
  baseHealth: number;
  avatarSeed: string | null;
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  nextSessionDate: Date | string | null;
  nextSessionType: string | null;
  dm: { id: string; name: string };
  members: { user: { id: string; name: string } }[];
  characters: Character[];
  sessions: { id: string; date: Date | string; title: string }[];
}

export function PlayerDashboard({ user, campaigns }: { user: User; campaigns: Campaign[] }) {
  const allChars = campaigns.flatMap((c) => c.characters);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 18, color: "var(--dungeon-purple)", marginBottom: 8 }}>
          🎲 Adventurer Dashboard
        </h1>
        <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>
          Welcome back, {user.name}. Your legend continues.
        </p>
      </div>

      {/* Characters overview */}
      {allChars.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 10, color: "var(--dungeon-text-dim)", marginBottom: 16 }}>
            Your Characters
          </h2>
          <div className="card-grid">
            {allChars.map((char) => (
              <CharacterCard key={char.id} character={char} />
            ))}
          </div>
        </div>
      )}

      {/* Campaigns */}
      <h2 style={{ fontSize: 10, color: "var(--dungeon-text-dim)", marginBottom: 16 }}>
        Your Campaigns
      </h2>

      {campaigns.length === 0 ? (
        <div
          className="pixel-border"
          style={{ background: "var(--dungeon-card)", padding: 48, textAlign: "center" }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          <p style={{ fontSize: 10, color: "var(--dungeon-text-dim)", marginBottom: 8 }}>
            No campaigns yet.
          </p>
          <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>
            Ask your DM to add you to a campaign!
          </p>
        </div>
      ) : (
        <div className="card-grid">
          {campaigns.map((c) => (
            <PlayerCampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function CharacterCard({ character: c }: { character: Character }) {
  const xpForLevel = c.level * 300;

  return (
    <div
      className="pixel-border-purple"
      style={{ background: "var(--dungeon-card)", padding: 16 }}
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <PixelAvatar seed={c.avatarSeed || c.name} charClass={c.class} size={48} />
        <div>
          <div style={{ fontSize: 10, color: "var(--dungeon-text)", marginBottom: 4 }}>{c.name}</div>
          <div style={{ fontSize: 7, color: "var(--dungeon-purple)" }}>{c.class}</div>
          <div style={{ fontSize: 8, color: "var(--dungeon-gold)", marginTop: 2 }}>
            LVL {c.level}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)", marginBottom: 4 }}>
          HP: {c.baseHealth}
        </div>
        <StatsBar value={c.baseHealth} max={c.baseHealth} type="hp" showNumbers={false} />
      </div>

      <div>
        <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)", marginBottom: 4 }}>
          XP: {c.xp} / {xpForLevel}
        </div>
        <StatsBar value={c.xp} max={xpForLevel} type="xp" showNumbers={false} />
      </div>
    </div>
  );
}

function PlayerCampaignCard({ campaign: c }: { campaign: Campaign }) {
  const statusClass =
    c.status === "ACTIVE" ? "badge-active" : c.status === "PAUSED" ? "badge-paused" : "badge-completed";

  return (
    <Link href={`/campaigns/${c.id}`} style={{ textDecoration: "none" }}>
      <div
        className="pixel-border"
        style={{ background: "var(--dungeon-card)", padding: 20, cursor: "pointer" }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--dungeon-purple)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--dungeon-border)")}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <h3 style={{ fontSize: 10, color: "var(--dungeon-text)", maxWidth: "70%" }}>{c.name}</h3>
          <span className={`pixel-badge ${statusClass}`}>{c.status}</span>
        </div>

        <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)", marginBottom: 12 }}>
          👑 DM: <span style={{ color: "var(--dungeon-gold)" }}>{c.dm.name}</span>
        </div>

        {c.characters.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {c.characters.map((ch) => (
              <div key={ch.id} style={{ fontSize: 7, color: "var(--dungeon-purple)" }}>
                🧙 {ch.name} — {ch.class} LVL {ch.level}
              </div>
            ))}
          </div>
        )}

        {c.nextSessionDate && (
          <div style={{ background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.3)", padding: "6px 10px", fontSize: 7 }}>
            📅 Next:{" "}
            <span style={{ color: "var(--dungeon-purple)" }}>
              {new Date(c.nextSessionDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
