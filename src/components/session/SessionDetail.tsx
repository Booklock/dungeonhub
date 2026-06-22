"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PixelAvatar } from "@/components/ui/PixelAvatar";
import { StatsBar } from "@/components/ui/StatsBar";

interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  baseHealth: number;
  avatarSeed: string | null;
  user: { id: string; name: string };
}

interface Creature {
  id: string;
  name: string;
  maxHp: number;
}

interface CombatEvent {
  id: string;
  eventType: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  amount: number;
  isFinalBlow: boolean;
  createdAt: Date | string;
}

interface PlayerNote {
  id: string;
  content: string;
  createdAt: Date | string;
  character: { id: string; name: string };
}

interface CharAchievement {
  id: string;
  achievement: { id: string; name: string; icon: string; description: string };
  character: { id: string; name: string };
}

interface GameSession {
  id: string;
  title: string;
  date: Date | string;
  notes: string | null;
  status: string;
  campaignId: string;
  campaign: {
    dmId: string;
    dm: { id: string; name: string };
    characters: Character[];
  };
  creatures: Creature[];
  combatEvents: CombatEvent[];
  playerNotes: PlayerNote[];
  characterAchievements: CharAchievement[];
}

type Tab = "combat" | "log" | "stats" | "notes";

interface Props {
  gameSession: GameSession;
  currentUserId: string;
  isDM: boolean;
  campaignId: string;
}

export function SessionDetail({ gameSession, currentUserId, isDM, campaignId }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(isDM ? "combat" : "log");
  const [loading, setLoading] = useState(false);

  // Creature form
  const [cName, setCName] = useState("");
  const [cHp, setCHp] = useState("20");

  // Combat event form
  const [evType, setEvType] = useState("DAMAGE");
  const [srcType, setSrcType] = useState("PLAYER");
  const [srcId, setSrcId] = useState(gameSession.campaign.characters[0]?.id || "");
  const [tgtType, setTgtType] = useState("CREATURE");
  const [tgtId, setTgtId] = useState(gameSession.creatures[0]?.id || "");
  const [amount, setAmount] = useState("");
  const [isFinalBlow, setIsFinalBlow] = useState(false);

  // Note form
  const [noteContent, setNoteContent] = useState("");
  const [noteCharId, setNoteCharId] = useState("");

  // Computed stats per character
  const charStats = useMemo(() => {
    const stats: Record<string, { damageDealt: number; damageReceived: number; healingDone: number; enemiesKilled: number }> = {};
    for (const ch of gameSession.campaign.characters) {
      stats[ch.id] = { damageDealt: 0, damageReceived: 0, healingDone: 0, enemiesKilled: 0 };
    }
    for (const ev of gameSession.combatEvents) {
      if (ev.sourceType === "PLAYER" && ev.eventType === "DAMAGE" && stats[ev.sourceId]) {
        stats[ev.sourceId].damageDealt += ev.amount;
        if (ev.isFinalBlow) stats[ev.sourceId].enemiesKilled += 1;
      }
      if (ev.targetType === "PLAYER" && ev.eventType === "DAMAGE" && stats[ev.targetId]) {
        stats[ev.targetId].damageReceived += ev.amount;
      }
      if (ev.sourceType === "PLAYER" && ev.eventType === "HEAL" && stats[ev.sourceId]) {
        stats[ev.sourceId].healingDone += ev.amount;
      }
    }
    return stats;
  }, [gameSession.combatEvents, gameSession.campaign.characters]);

  const creatureMap = Object.fromEntries(gameSession.creatures.map((c) => [c.id, c]));
  const charMap = Object.fromEntries(gameSession.campaign.characters.map((c) => [c.id, c]));

  async function addCreature(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/sessions/${gameSession.id}/creatures`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cName, maxHp: parseInt(cHp) }),
    });
    setLoading(false);
    if (res.ok) {
      setCName(""); setCHp("20");
      router.refresh();
    }
  }

  async function logCombat(e: React.FormEvent) {
    e.preventDefault();
    if (!srcId || !tgtId || !amount) return;
    setLoading(true);
    const res = await fetch(`/api/sessions/${gameSession.id}/combat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: evType, sourceType: srcType, sourceId: srcId, targetType: tgtType, targetId: tgtId, amount: parseInt(amount), isFinalBlow }),
    });
    setLoading(false);
    if (res.ok) {
      setAmount(""); setIsFinalBlow(false);
      router.refresh();
    }
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent || !noteCharId) return;
    setLoading(true);
    const res = await fetch(`/api/sessions/${gameSession.id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId: noteCharId, content: noteContent }),
    });
    setLoading(false);
    if (res.ok) {
      setNoteContent("");
      router.refresh();
    }
  }

  async function markComplete() {
    await fetch(`/api/sessions/${gameSession.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    router.refresh();
  }

  // Current user's characters in this session
  const myChars = gameSession.campaign.characters.filter((c) => c.user.id === currentUserId);

  function getActorName(type: string, id: string) {
    if (type === "PLAYER") return charMap[id]?.name || id;
    return creatureMap[id]?.name || id;
  }

  const leaderboard = Object.entries(charStats)
    .map(([id, s]) => ({ char: charMap[id], ...s }))
    .filter((e) => e.char)
    .sort((a, b) => b.damageDealt - a.damageDealt);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: 16, display: "flex", gap: 8, fontSize: 8, color: "var(--dungeon-text-dim)" }}>
        <Link href="/dashboard" style={{ color: "var(--dungeon-text-dim)", textDecoration: "none" }}>Dashboard</Link>
        <span>›</span>
        <Link href={`/campaigns/${campaignId}`} style={{ color: "var(--dungeon-text-dim)", textDecoration: "none" }}>Campaign</Link>
        <span>›</span>
        <span style={{ color: "var(--dungeon-text)" }}>{gameSession.title}</span>
      </div>

      {/* Session Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: 14, color: "var(--dungeon-gold)" }}>📜 {gameSession.title}</h1>
            <span className={`pixel-badge ${gameSession.status === "PLANNED" ? "badge-planned" : "badge-active"}`}>
              {gameSession.status}
            </span>
          </div>
          <div style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>
            {new Date(gameSession.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {isDM && gameSession.status === "PLANNED" && (
          <button onClick={markComplete} className="pixel-btn pixel-btn-gold">
            ✓ Mark Complete
          </button>
        )}
      </div>

      {/* DM Notes */}
      {gameSession.notes && (
        <div className="pixel-border" style={{ background: "rgba(255,215,0,0.04)", borderColor: "rgba(255,215,0,0.3)", padding: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 7, color: "var(--dungeon-gold)", marginBottom: 8 }}>📖 DM Notes</div>
          <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)", lineHeight: 2.5 }}>{gameSession.notes}</p>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid var(--dungeon-border)" }}>
        {([
          { id: "combat", label: "⚔️ Combat", dmOnly: false },
          { id: "log", label: "📋 Log", dmOnly: false },
          { id: "stats", label: "📊 Stats", dmOnly: false },
          { id: "notes", label: "📝 Notes", dmOnly: false },
        ] as { id: Tab; label: string; dmOnly: boolean }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8,
              padding: "10px 16px",
              background: tab === t.id ? "var(--dungeon-purple)" : "transparent",
              color: tab === t.id ? "white" : "var(--dungeon-text-dim)",
              border: "none",
              cursor: "pointer",
              borderBottom: tab === t.id ? "3px solid var(--dungeon-gold)" : "none",
              marginBottom: "-2px",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* COMBAT TAB */}
      {tab === "combat" && (
        <div style={{ display: "grid", gridTemplateColumns: isDM ? "1fr 1fr" : "1fr", gap: 24 }}>
          {isDM && (
            <div>
              {/* Add Creature */}
              <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontSize: 10, color: "var(--dungeon-red)", marginBottom: 16 }}>🐉 Add Creature</h3>
                <form onSubmit={addCreature} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label className="pixel-label">Name</label>
                    <input className="pixel-input" value={cName} onChange={(e) => setCName(e.target.value)} placeholder="Goblin, Dragon..." required />
                  </div>
                  <div>
                    <label className="pixel-label">Max HP</label>
                    <input className="pixel-input" type="number" min={1} value={cHp} onChange={(e) => setCHp(e.target.value)} />
                  </div>
                  <button type="submit" className="pixel-btn pixel-btn-danger" disabled={loading} style={{ justifyContent: "center" }}>
                    + Spawn
                  </button>
                </form>
              </div>

              {/* Log Combat Event */}
              <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 20 }}>
                <h3 style={{ fontSize: 10, color: "var(--dungeon-purple)", marginBottom: 16 }}>⚔️ Log Event</h3>
                <form onSubmit={logCombat} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label className="pixel-label">Event Type</label>
                    <select className="pixel-select" value={evType} onChange={(e) => setEvType(e.target.value)}>
                      <option value="DAMAGE">⚔️ Damage</option>
                      <option value="HEAL">💚 Heal</option>
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label className="pixel-label">Source Type</label>
                      <select className="pixel-select" value={srcType} onChange={(e) => { setSrcType(e.target.value); setSrcId(""); }}>
                        <option value="PLAYER">Player</option>
                        <option value="CREATURE">Creature</option>
                      </select>
                    </div>
                    <div>
                      <label className="pixel-label">Source</label>
                      <select className="pixel-select" value={srcId} onChange={(e) => setSrcId(e.target.value)}>
                        <option value="">Select...</option>
                        {srcType === "PLAYER"
                          ? gameSession.campaign.characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                          : gameSession.creatures.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                        }
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label className="pixel-label">Target Type</label>
                      <select className="pixel-select" value={tgtType} onChange={(e) => { setTgtType(e.target.value); setTgtId(""); }}>
                        <option value="CREATURE">Creature</option>
                        <option value="PLAYER">Player</option>
                      </select>
                    </div>
                    <div>
                      <label className="pixel-label">Target</label>
                      <select className="pixel-select" value={tgtId} onChange={(e) => setTgtId(e.target.value)}>
                        <option value="">Select...</option>
                        {tgtType === "CREATURE"
                          ? gameSession.creatures.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                          : gameSession.campaign.characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                        }
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="pixel-label">Amount</label>
                    <input className="pixel-input" type="number" min={0} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="15" required />
                  </div>

                  {evType === "DAMAGE" && tgtType === "CREATURE" && (
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 8, color: "var(--dungeon-gold)", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={isFinalBlow}
                        onChange={(e) => setIsFinalBlow(e.target.checked)}
                        style={{ width: 16, height: 16, cursor: "pointer" }}
                      />
                      💀 Final Blow (kills enemy)
                    </label>
                  )}

                  <button type="submit" className="pixel-btn pixel-btn-primary" disabled={loading} style={{ justifyContent: "center" }}>
                    {loading ? "Logging..." : "⚔️ Log Event"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Creatures list */}
          <div>
            <h3 style={{ fontSize: 10, color: "var(--dungeon-text-dim)", marginBottom: 16 }}>Creatures in Battle</h3>
            {gameSession.creatures.length === 0 ? (
              <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 24, textAlign: "center" }}>
                <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>
                  {isDM ? "Spawn creatures above to begin combat." : "No enemies yet."}
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {gameSession.creatures.map((creature) => {
                  const totalDmg = gameSession.combatEvents
                    .filter((e) => e.targetId === creature.id && e.targetType === "CREATURE" && e.eventType === "DAMAGE")
                    .reduce((s, e) => s + e.amount, 0);
                  const alive = !gameSession.combatEvents.some((e) => e.targetId === creature.id && e.isFinalBlow);
                  const currentHp = Math.max(0, creature.maxHp - totalDmg);

                  return (
                    <div
                      key={creature.id}
                      className="pixel-border"
                      style={{
                        background: "var(--dungeon-card)",
                        padding: 14,
                        opacity: alive ? 1 : 0.5,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: alive ? "var(--dungeon-red)" : "var(--dungeon-text-dim)" }}>
                          {alive ? "🐉" : "💀"} {creature.name}
                        </div>
                        {!alive && <span style={{ fontSize: 7, color: "var(--dungeon-red)" }}>DEAD</span>}
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        <StatsBar value={alive ? currentHp : 0} max={creature.maxHp} type="hp" />
                      </div>
                      <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)" }}>
                        Total dmg: {totalDmg}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOG TAB */}
      {tab === "log" && (
        <div>
          <h3 style={{ fontSize: 10, color: "var(--dungeon-text-dim)", marginBottom: 16 }}>
            Combat Log ({gameSession.combatEvents.length} events)
          </h3>
          {gameSession.combatEvents.length === 0 ? (
            <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 32, textAlign: "center" }}>
              <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>No combat events yet.</p>
            </div>
          ) : (
            <div style={{ maxHeight: 500, overflowY: "auto" }}>
              {[...gameSession.combatEvents].reverse().map((ev) => {
                const isKill = ev.isFinalBlow;
                const isHeal = ev.eventType === "HEAL";
                const logClass = isKill ? "combat-log-kill" : isHeal ? "combat-log-heal" : "combat-log-damage";
                const srcName = getActorName(ev.sourceType, ev.sourceId);
                const tgtName = getActorName(ev.targetType, ev.targetId);

                return (
                  <div key={ev.id} className={`combat-log-entry ${logClass}`}>
                    <span style={{ color: "inherit" }}>
                      {isKill && "💀 "}
                      {isHeal && "💚 "}
                      {!isKill && !isHeal && "⚔️ "}
                      <strong>{srcName}</strong>
                      {isHeal ? " healed " : " dealt "}
                      <strong style={{ color: isKill ? "var(--dungeon-gold)" : "inherit" }}>
                        {ev.amount} {isHeal ? "HP" : "damage"}
                      </strong>
                      {" to "}
                      <strong>{tgtName}</strong>
                      {isKill && " (FINAL BLOW!)"}
                    </span>
                    <div style={{ fontSize: 6, opacity: 0.7, marginTop: 2 }}>
                      {new Date(ev.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* STATS TAB */}
      {tab === "stats" && (
        <div>
          <h3 style={{ fontSize: 10, color: "var(--dungeon-text-dim)", marginBottom: 16 }}>Session Stats</h3>

          {/* Leaderboard */}
          {leaderboard.length === 0 ? (
            <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 32, textAlign: "center" }}>
              <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>No combat data yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {leaderboard.map((entry, i) => (
                <div
                  key={entry.char.id}
                  className={i === 0 ? "pixel-border-gold" : "pixel-border"}
                  style={{ background: "var(--dungeon-card)", padding: 16 }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ fontSize: 16 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🎖️"}</div>
                    <PixelAvatar seed={entry.char.avatarSeed || entry.char.name} charClass={entry.char.class} size={40} />
                    <div>
                      <div style={{ fontSize: 10, color: "var(--dungeon-text)" }}>{entry.char.name}</div>
                      <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)" }}>{entry.char.class}</div>
                    </div>
                    {i === 0 && entry.damageDealt > 0 && (
                      <span className="achievement-badge" style={{ marginLeft: "auto" }}>
                        🏆 DPS Leader
                      </span>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                    {[
                      { label: "DMG Dealt", value: entry.damageDealt, color: "var(--dungeon-red)" },
                      { label: "DMG Recv", value: entry.damageReceived, color: "#f97316" },
                      { label: "Healing", value: entry.healingDone, color: "var(--dungeon-green)" },
                      { label: "Kills", value: entry.enemiesKilled, color: "var(--dungeon-gold)" },
                    ].map((s) => (
                      <div key={s.label} style={{ textAlign: "center", background: "var(--dungeon-surface)", padding: "8px 4px" }}>
                        <div style={{ fontSize: 14, color: s.color, marginBottom: 4 }}>{s.value}</div>
                        <div style={{ fontSize: 6, color: "var(--dungeon-text-dim)" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Achievements */}
          {isDM && (
            <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 20 }}>
              <h4 style={{ fontSize: 9, color: "var(--dungeon-gold)", marginBottom: 12 }}>🏆 Session Achievements</h4>
              {gameSession.characterAchievements.length === 0 ? (
                <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>No achievements awarded yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {gameSession.characterAchievements.map((a) => (
                    <div key={a.id} className="achievement-badge">
                      ★ {a.character.name}: {a.achievement.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* NOTES TAB */}
      {tab === "notes" && (
        <div>
          {/* Add note form (for players) */}
          {myChars.length > 0 && (
            <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 20, marginBottom: 20 }}>
              <h3 style={{ fontSize: 10, color: "var(--dungeon-purple)", marginBottom: 16 }}>📝 Add Note</h3>
              <form onSubmit={addNote} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myChars.length > 1 && (
                  <div>
                    <label className="pixel-label">Character</label>
                    <select className="pixel-select" value={noteCharId} onChange={(e) => setNoteCharId(e.target.value)} required>
                      <option value="">Select character...</option>
                      {myChars.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="pixel-label">Note</label>
                  <textarea
                    className="pixel-textarea"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="What happened in this session..."
                    required
                    onFocus={() => { if (myChars.length === 1 && !noteCharId) setNoteCharId(myChars[0].id); }}
                  />
                </div>
                <button type="submit" className="pixel-btn pixel-btn-primary" disabled={loading} style={{ justifyContent: "center" }}>
                  💾 Save Note
                </button>
              </form>
            </div>
          )}

          {/* Notes list */}
          {gameSession.playerNotes.length === 0 ? (
            <div className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 32, textAlign: "center" }}>
              <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>No notes yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {gameSession.playerNotes.map((note) => (
                <div key={note.id} className="pixel-border" style={{ background: "var(--dungeon-card)", padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ fontSize: 8, color: "var(--dungeon-purple)" }}>{note.character.name}</div>
                    <div style={{ fontSize: 7, color: "var(--dungeon-text-dim)" }}>
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p style={{ fontSize: 8, color: "var(--dungeon-text)", lineHeight: 2.5 }}>{note.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

}
