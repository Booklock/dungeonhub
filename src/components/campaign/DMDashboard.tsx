"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { User } from "next-auth";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  nextSessionDate: Date | string | null;
  nextSessionType: string | null;
  members: { user: { id: string; name: string } }[];
  characters: { id: string }[];
  sessions: { id: string; date: Date | string; title: string }[];
}

export function DMDashboard({ user, campaigns }: { user: User; campaigns: Campaign[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [nextType, setNextType] = useState("IN_PERSON");
  const [loading, setLoading] = useState(false);

  async function createCampaign(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, nextSessionDate: nextDate || null, nextSessionType: nextType }),
    });
    setLoading(false);
    if (res.ok) {
      setShowCreate(false);
      setName("");
      setDescription("");
      router.refresh();
    }
  }

  const active = campaigns.filter((c) => c.status === "ACTIVE");
  const others = campaigns.filter((c) => c.status !== "ACTIVE");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 18, color: "var(--dungeon-gold)", marginBottom: 8 }}>
            👑 DM Command Center
          </h1>
          <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>
            Welcome back, {user.name}. Your realm awaits.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="pixel-btn pixel-btn-gold"
        >
          + New Campaign
        </button>
      </div>

      {/* Stats overview */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          { label: "Campaigns", value: campaigns.length, icon: "🗺️" },
          { label: "Players", value: new Set(campaigns.flatMap((c) => c.members.map((m) => m.user.id))).size, icon: "⚔️" },
          { label: "Characters", value: campaigns.reduce((s, c) => s + c.characters.length, 0), icon: "🧙" },
        ].map((stat) => (
          <div key={stat.label} className="pixel-border stat-card">
            <div style={{ fontSize: 24, marginBottom: 8 }}>{stat.icon}</div>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
            padding: 24,
          }}
        >
          <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 32, width: "100%", maxWidth: 480 }}>
            <h2 style={{ fontSize: 12, color: "var(--dungeon-gold)", marginBottom: 24 }}>
              ⚔️ Create Campaign
            </h2>
            <form onSubmit={createCampaign} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="pixel-label">Campaign Name</label>
                <input className="pixel-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="The Lost Mines..." required />
              </div>
              <div>
                <label className="pixel-label">Description</label>
                <textarea className="pixel-textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A tale of adventure..." />
              </div>
              <div>
                <label className="pixel-label">Next Session Date</label>
                <input className="pixel-input" type="datetime-local" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
              </div>
              <div>
                <label className="pixel-label">Session Type</label>
                <select className="pixel-select" value={nextType} onChange={(e) => setNextType(e.target.value)}>
                  <option value="IN_PERSON">🏰 In Person</option>
                  <option value="ONLINE">💻 Online</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="submit" className="pixel-btn pixel-btn-gold" disabled={loading} style={{ flex: 1, justifyContent: "center" }}>
                  {loading ? "Creating..." : "⚔️ Create"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="pixel-btn pixel-btn-ghost">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign list */}
      {campaigns.length === 0 ? (
        <div
          className="pixel-border"
          style={{ background: "var(--dungeon-card)", padding: 48, textAlign: "center" }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
          <p style={{ fontSize: 10, color: "var(--dungeon-text-dim)", marginBottom: 16 }}>
            No campaigns yet.
          </p>
          <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>
            Create your first campaign to begin the adventure!
          </p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <>
              <h2 style={{ fontSize: 10, color: "var(--dungeon-text-dim)", marginBottom: 16 }}>
                Active Campaigns
              </h2>
              <div className="card-grid" style={{ marginBottom: 32 }}>
                {active.map((c) => (
                  <CampaignCard key={c.id} campaign={c} />
                ))}
              </div>
            </>
          )}
          {others.length > 0 && (
            <>
              <h2 style={{ fontSize: 10, color: "var(--dungeon-text-dim)", marginBottom: 16 }}>
                Other Campaigns
              </h2>
              <div className="card-grid">
                {others.map((c) => (
                  <CampaignCard key={c.id} campaign={c} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function CampaignCard({ campaign: c }: { campaign: Campaign }) {
  const statusClass =
    c.status === "ACTIVE" ? "badge-active" : c.status === "PAUSED" ? "badge-paused" : "badge-completed";

  return (
    <Link href={`/campaigns/${c.id}`} style={{ textDecoration: "none" }}>
      <div
        className="pixel-border"
        style={{
          background: "var(--dungeon-card)",
          padding: 20,
          cursor: "pointer",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--dungeon-gold)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--dungeon-border)")}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <h3 style={{ fontSize: 10, color: "var(--dungeon-text)", maxWidth: "70%" }}>{c.name}</h3>
          <span className={`pixel-badge ${statusClass}`}>{c.status}</span>
        </div>

        {c.description && (
          <p style={{ fontSize: 7, color: "var(--dungeon-text-dim)", marginBottom: 12, lineHeight: 2 }}>
            {c.description.slice(0, 80)}{c.description.length > 80 ? "..." : ""}
          </p>
        )}

        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)" }}>
            👥 {c.members.length} players
          </div>
          <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)" }}>
            🧙 {c.characters.length} chars
          </div>
          <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)" }}>
            📜 {c.sessions.length > 0 ? "1 session" : "No sessions"}
          </div>
        </div>

        {c.nextSessionDate && (
          <div
            style={{
              background: "rgba(255,215,0,0.05)",
              border: "1px solid rgba(255,215,0,0.3)",
              padding: "6px 10px",
              fontSize: 7,
            }}
          >
            📅 Next:{" "}
            <span style={{ color: "var(--dungeon-gold)" }}>
              {new Date(c.nextSessionDate).toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric",
              })}
            </span>
            {c.nextSessionType && (
              <span style={{ color: "var(--dungeon-text-dim)", marginLeft: 8 }}>
                {c.nextSessionType === "IN_PERSON" ? "🏰" : "💻"} {c.nextSessionType === "IN_PERSON" ? "In Person" : "Online"}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
