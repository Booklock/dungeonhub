"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { StatsBar } from "@/components/ui/StatsBar";

interface Achievement {
  achievement: { id: string; name: string; icon: string };
}

interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  xp: number;
  baseHealth: number;
  avatarSeed: string | null;
  userId: string;
  user: { id: string; name: string };
  achievements: Achievement[];
}

interface Member {
  user: { id: string; name: string; email: string };
}

interface Session {
  id: string;
  title: string;
  date: Date | string;
  status: string;
  notes: string | null;
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  nextSessionDate: Date | string | null;
  nextSessionType: string | null;
  dm: { id: string; name: string; email: string };
  members: Member[];
  characters: Character[];
  sessions: Session[];
}

interface Props {
  campaign: Campaign;
  currentUserId: string;
  isDM: boolean;
}

type Tab = "overview" | "characters" | "sessions" | "members";

export function CampaignDetail({ campaign, currentUserId, isDM }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddChar, setShowAddChar] = useState(false);
  const [showAddSession, setShowAddSession] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberMsg, setMemberMsg] = useState("");

  // Character form
  const [charName, setCharName] = useState("");
  const [charClass, setCharClass] = useState("Fighter");
  const [charLevel, setCharLevel] = useState("1");
  const [charXp, setCharXp] = useState("0");
  const [charHp, setCharHp] = useState("20");
  const [charTarget, setCharTarget] = useState(currentUserId);

  // Session form
  const [sessTitle, setSessTitle] = useState("");
  const [sessDate, setSessDate] = useState("");
  const [sessNotes, setSessNotes] = useState("");

  const [loading, setLoading] = useState(false);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/campaigns/${campaign.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: memberEmail }),
    });
    setLoading(false);
    if (res.ok) {
      setMemberEmail("");
      setShowAddMember(false);
      router.refresh();
    } else {
      const d = await res.json();
      setMemberMsg(d.error || "Failed");
    }
  }

  async function addCharacter(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/campaigns/${campaign.id}/characters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: charName, charClass, level: parseInt(charLevel), xp: parseInt(charXp),
        baseHealth: parseInt(charHp), avatarSeed: charName, targetUserId: charTarget,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setShowAddChar(false);
      setCharName(""); setCharClass("Fighter"); setCharLevel("1"); setCharXp("0"); setCharHp("20");
      router.refresh();
    }
  }

  async function addSession(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/campaigns/${campaign.id}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: sessTitle, date: sessDate, notes: sessNotes }),
    });
    setLoading(false);
    if (res.ok) {
      setShowAddSession(false);
      setSessTitle(""); setSessDate(""); setSessNotes("");
      router.refresh();
    }
  }

  const CLASSES = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {/* Back + Header */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/dashboard" style={{ fontSize: 8, color: "var(--dungeon-text-dim)", textDecoration: "none" }}>
          ← Back to Dashboard
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 16, color: "var(--dungeon-gold)" }}>{campaign.name}</h1>
            <span className={`pixel-badge badge-${campaign.status.toLowerCase()}`}>{campaign.status}</span>
          </div>
          {campaign.description && (
            <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)", maxWidth: 600 }}>{campaign.description}</p>
          )}
          <div style={{ fontSize: 8, color: "var(--dungeon-text-dim)", marginTop: 8 }}>
            👑 DM: <span style={{ color: "var(--dungeon-gold)" }}>{campaign.dm.name}</span>
            &nbsp;·&nbsp;
            👥 {campaign.members.length} members
            &nbsp;·&nbsp;
            📜 {campaign.sessions.length} sessions
          </div>
        </div>

        {campaign.nextSessionDate && (
          <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: "12px 16px", textAlign: "center", minWidth: 160 }}>
            <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)", marginBottom: 6 }}>Next Session</div>
            <div style={{ fontSize: 10, color: "var(--dungeon-gold)", marginBottom: 4 }}>
              {new Date(campaign.nextSessionDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
            <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)" }}>
              {campaign.nextSessionType === "IN_PERSON" ? "🏰 In Person" : "💻 Online"}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid var(--dungeon-border)", paddingBottom: 0 }}>
        {(["overview", "characters", "sessions", "members"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8,
              padding: "10px 16px",
              background: tab === t ? "var(--dungeon-purple)" : "transparent",
              color: tab === t ? "white" : "var(--dungeon-text-dim)",
              border: "none",
              cursor: "pointer",
              textTransform: "capitalize",
              borderBottom: tab === t ? "3px solid var(--dungeon-gold)" : "none",
              marginBottom: "-2px",
            }}
          >
            {t === "overview" && "📊 "}
            {t === "characters" && "🧙 "}
            {t === "sessions" && "📜 "}
            {t === "members" && "👥 "}
            {t}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
            {[
              { label: "Members", value: campaign.members.length, icon: "👥" },
              { label: "Characters", value: campaign.characters.length, icon: "🧙" },
              { label: "Sessions", value: campaign.sessions.length, icon: "📜" },
              { label: "Avg Level", value: campaign.characters.length ? Math.round(campaign.characters.reduce((s, c) => s + c.level, 0) / campaign.characters.length) : 0, icon: "⭐" },
            ].map((s) => (
              <div key={s.label} className="pixel-border stat-card">
                <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Recent session */}
          {campaign.sessions.length > 0 && (
            <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 10, color: "var(--dungeon-text-dim)", marginBottom: 12 }}>Last Session</h3>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--dungeon-text)", marginBottom: 4 }}>{campaign.sessions[0].title}</div>
                  <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)" }}>
                    {new Date(campaign.sessions[0].date).toLocaleDateString()}
                  </div>
                </div>
                <Link href={`/campaigns/${campaign.id}/sessions/${campaign.sessions[0].id}`}>
                  <button className="pixel-btn pixel-btn-ghost" style={{ fontSize: 7 }}>View →</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Characters Tab */}
      {tab === "characters" && (
        <div>
          {isDM && (
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setShowAddChar(true)} className="pixel-btn pixel-btn-purple" style={{ background: "var(--dungeon-purple)", color: "white", borderColor: "#7c3aed", boxShadow: "3px 3px 0 0 #4c1d95" }}>
                + Add Character
              </button>
            </div>
          )}

          {!isDM && !campaign.characters.some((c) => c.userId === currentUserId) && (
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setShowAddChar(true)} className="pixel-btn pixel-btn-primary">
                + Create My Character
              </button>
            </div>
          )}

          {campaign.characters.length === 0 ? (
            <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 32, textAlign: "center" }}>
              <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>No characters yet. Add your first hero!</p>
            </div>
          ) : (
            <div className="card-grid">
              {campaign.characters.map((char) => (
                <CharCard key={char.id} char={char} currentUserId={currentUserId} isDM={isDM} campaignId={campaign.id} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {tab === "sessions" && (
        <div>
          {isDM && (
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setShowAddSession(true)} className="pixel-btn pixel-btn-gold">
                + New Session
              </button>
            </div>
          )}
          {campaign.sessions.length === 0 ? (
            <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 32, textAlign: "center" }}>
              <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>No sessions yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {campaign.sessions.map((s) => (
                <Link key={s.id} href={`/campaigns/${campaign.id}/sessions/${s.id}`} style={{ textDecoration: "none" }}>
                  <div
                    className="pixel-border"
                    style={{ background: "var(--dungeon-card)", padding: 16, cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--dungeon-gold)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--dungeon-border)")}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 10, color: "var(--dungeon-text)", marginBottom: 4 }}>{s.title}</div>
                        <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)" }}>
                          {new Date(s.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className={`pixel-badge ${s.status === "PLANNED" ? "badge-planned" : "badge-active"}`}>
                          {s.status}
                        </span>
                        <span style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>→</span>
                      </div>
                    </div>
                    {s.notes && (
                      <p style={{ fontSize: 7, color: "var(--dungeon-text-dim)", marginTop: 8 }}>
                        {s.notes.slice(0, 100)}{s.notes.length > 100 ? "..." : ""}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members Tab */}
      {tab === "members" && (
        <div>
          {isDM && (
            <div style={{ marginBottom: 20 }}>
              <button onClick={() => setShowAddMember(true)} className="pixel-btn pixel-btn-ghost">
                + Add Player
              </button>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {campaign.members.map((m) => (
              <div key={m.user.id} className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, color: "var(--dungeon-text)" }}>{m.user.name}</div>
                  <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)", marginTop: 4 }}>{m.user.email}</div>
                </div>
                <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)" }}>
                  {campaign.characters.filter((c) => c.userId === m.user.id).map((c) => c.name).join(", ") || "No character"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Member */}
      {showAddMember && (
        <Modal onClose={() => setShowAddMember(false)} title="Add Player to Campaign">
          <form onSubmit={addMember} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="pixel-label">Player Email</label>
              <input className="pixel-input" type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} placeholder="player@dungeon.com" required />
            </div>
            {memberMsg && <p style={{ fontSize: 8, color: "var(--dungeon-red)" }}>⚠ {memberMsg}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="pixel-btn pixel-btn-primary" disabled={loading} style={{ flex: 1, justifyContent: "center" }}>
                {loading ? "Adding..." : "Add Player"}
              </button>
              <button type="button" onClick={() => setShowAddMember(false)} className="pixel-btn pixel-btn-ghost">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Add Character */}
      {showAddChar && (
        <Modal onClose={() => setShowAddChar(false)} title="Create Character">
          <form onSubmit={addCharacter} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="pixel-label">Character Name</label>
              <input className="pixel-input" value={charName} onChange={(e) => setCharName(e.target.value)} placeholder="Aragorn" required />
            </div>
            <div>
              <label className="pixel-label">Class</label>
              <select className="pixel-select" value={charClass} onChange={(e) => setCharClass(e.target.value)}>
                {CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label className="pixel-label">Level</label>
                <input className="pixel-input" type="number" min={1} max={20} value={charLevel} onChange={(e) => setCharLevel(e.target.value)} />
              </div>
              <div>
                <label className="pixel-label">XP</label>
                <input className="pixel-input" type="number" min={0} value={charXp} onChange={(e) => setCharXp(e.target.value)} />
              </div>
              <div>
                <label className="pixel-label">Max HP</label>
                <input className="pixel-input" type="number" min={1} value={charHp} onChange={(e) => setCharHp(e.target.value)} />
              </div>
            </div>
            {isDM && campaign.members.length > 0 && (
              <div>
                <label className="pixel-label">Assign to Player</label>
                <select className="pixel-select" value={charTarget} onChange={(e) => setCharTarget(e.target.value)}>
                  {campaign.members.map((m) => (
                    <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="pixel-btn pixel-btn-primary" disabled={loading} style={{ flex: 1, justifyContent: "center" }}>
                {loading ? "Creating..." : "🧙 Create"}
              </button>
              <button type="button" onClick={() => setShowAddChar(false)} className="pixel-btn pixel-btn-ghost">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Add Session */}
      {showAddSession && (
        <Modal onClose={() => setShowAddSession(false)} title="New Session">
          <form onSubmit={addSession} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="pixel-label">Session Title</label>
              <input className="pixel-input" value={sessTitle} onChange={(e) => setSessTitle(e.target.value)} placeholder="The Dark Caves of Despair" required />
            </div>
            <div>
              <label className="pixel-label">Date</label>
              <input className="pixel-input" type="datetime-local" value={sessDate} onChange={(e) => setSessDate(e.target.value)} required />
            </div>
            <div>
              <label className="pixel-label">DM Notes (optional)</label>
              <textarea className="pixel-textarea" value={sessNotes} onChange={(e) => setSessNotes(e.target.value)} placeholder="Session notes..." />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button type="submit" className="pixel-btn pixel-btn-gold" disabled={loading} style={{ flex: 1, justifyContent: "center" }}>
                {loading ? "Creating..." : "📜 Create Session"}
              </button>
              <button type="button" onClick={() => setShowAddSession(false)} className="pixel-btn pixel-btn-ghost">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function CharCard({ char, currentUserId, isDM }: { char: Character; currentUserId: string; isDM: boolean; campaignId: string }) {
  const router = useRouter();
  const xpForLevel = char.level * 300;
  const isOwn = char.userId === currentUserId;

  async function updateChar(field: string, value: string | number) {
    await fetch(`/api/characters/${char.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    router.refresh();
  }

  return (
    <div
      className={isOwn ? "pixel-border-purple" : "pixel-border"}
      style={{ background: "var(--dungeon-card)", padding: 16 }}
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <PixelAvatar seed={char.avatarSeed || char.name} charClass={char.class} size={56} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontSize: 10, color: "var(--dungeon-text)", marginBottom: 2 }}>{char.name}</div>
            {isOwn && <span style={{ fontSize: 7, color: "var(--dungeon-purple)" }}>you</span>}
          </div>
          <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)", marginBottom: 2 }}>{char.user.name}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ fontSize: 7, color: "var(--dungeon-purple)" }}>{char.class}</span>
            <span style={{ fontSize: 8, color: "var(--dungeon-gold)" }}>LVL {char.level}</span>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 7, color: "var(--dungeon-text-dim)" }}>HP</span>
          <span style={{ fontSize: 7, color: "var(--dungeon-green)" }}>{char.baseHealth}</span>
        </div>
        <StatsBar value={char.baseHealth} max={char.baseHealth} type="hp" showNumbers={false} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 7, color: "var(--dungeon-text-dim)" }}>XP</span>
          <span style={{ fontSize: 7, color: "var(--dungeon-purple)" }}>{char.xp}/{xpForLevel}</span>
        </div>
        <StatsBar value={char.xp} max={xpForLevel} type="xp" showNumbers={false} />
      </div>

      {char.achievements.length > 0 && (
        <div style={{ marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {char.achievements.slice(0, 3).map((a) => (
            <span key={a.achievement.id} className="achievement-badge" style={{ fontSize: 7 }}>
              ★ {a.achievement.name}
            </span>
          ))}
        </div>
      )}

      {isDM && (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              const lvl = prompt("New level (1-20):", String(char.level));
              if (lvl) updateChar("level", parseInt(lvl));
            }}
            className="pixel-btn pixel-btn-ghost"
            style={{ flex: 1, fontSize: 7, justifyContent: "center" }}
          >
            Edit LVL
          </button>
          <button
            onClick={() => {
              const xp = prompt("Set XP:", String(char.xp));
              if (xp !== null) updateChar("xp", parseInt(xp));
            }}
            className="pixel-btn pixel-btn-ghost"
            style={{ flex: 1, fontSize: 7, justifyContent: "center" }}
          >
            Edit XP
          </button>
        </div>
      )}
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 24 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 32, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 12, color: "var(--dungeon-gold)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--dungeon-text-dim)", cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
