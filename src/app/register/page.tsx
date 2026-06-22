"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("PLAYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/login");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--dungeon-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🧙‍♂️</div>
        <h1
          className="glow-gold"
          style={{ fontSize: 20, color: "var(--dungeon-gold)", marginBottom: 8 }}
        >
          DungeonHub
        </h1>
        <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>Create your legend</p>
      </div>

      <div
        className="pixel-border"
        style={{
          background: "var(--dungeon-card)",
          padding: 32,
          width: "100%",
          maxWidth: 400,
        }}
      >
        <h2 style={{ fontSize: 12, color: "var(--dungeon-text)", marginBottom: 24, textAlign: "center" }}>
          Choose Your Path
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="pixel-label">Hero Name</label>
            <input
              className="pixel-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aragorn"
              required
            />
          </div>

          <div>
            <label className="pixel-label">Email</label>
            <input
              className="pixel-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hero@dungeon.com"
              required
            />
          </div>

          <div>
            <label className="pixel-label">Password</label>
            <input
              className="pixel-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="pixel-label">Role</label>
            <select
              className="pixel-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="PLAYER">🎲 Player — Join campaigns</option>
              <option value="DM">👑 Dungeon Master — Run campaigns</option>
            </select>
            <p style={{ fontSize: 7, color: "var(--dungeon-text-dim)", marginTop: 6 }}>
              {role === "DM"
                ? "You will create and manage campaigns"
                : "You will join existing campaigns"}
            </p>
          </div>

          {error && (
            <p style={{ fontSize: 8, color: "var(--dungeon-red)", textAlign: "center" }}>
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            className="pixel-btn pixel-btn-primary"
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Creating..." : "🎲 Begin Your Journey"}
          </button>
        </form>

        <hr className="pixel-divider" style={{ marginTop: 24 }} />
        <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)", textAlign: "center" }}>
          Already a hero?{" "}
          <Link
            href="/login"
            style={{ color: "var(--dungeon-purple)", textDecoration: "none" }}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
