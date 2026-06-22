"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials. Try again.");
    } else {
      router.push("/dashboard");
    }
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
      {/* Hero title */}
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⚔️</div>
        <h1
          className="glow-gold"
          style={{
            fontSize: 20,
            color: "var(--dungeon-gold)",
            marginBottom: 8,
            letterSpacing: 2,
          }}
        >
          DungeonHub
        </h1>
        <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>
          Your D&D Campaign Companion
        </p>
      </div>

      {/* Login card */}
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
          Enter the Dungeon
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p style={{ fontSize: 8, color: "var(--dungeon-red)", textAlign: "center" }}>
              ⚠ {error}
            </p>
          )}

          <button
            type="submit"
            className="pixel-btn pixel-btn-gold"
            style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
            disabled={loading}
          >
            {loading ? "Loading..." : "⚔️ Start Adventure"}
          </button>
        </form>

        <hr className="pixel-divider" style={{ marginTop: 24 }} />
        <p style={{ fontSize: 8, color: "var(--dungeon-text-dim)", textAlign: "center" }}>
          New hero?{" "}
          <Link
            href="/register"
            style={{ color: "var(--dungeon-purple)", textDecoration: "none" }}
          >
            Create Account
          </Link>
        </p>
      </div>

      {/* Flavor text */}
      <p
        style={{
          fontSize: 7,
          color: "var(--dungeon-text-dim)",
          marginTop: 32,
          textAlign: "center",
          maxWidth: 320,
          lineHeight: 2.5,
        }}
      >
        ★ Track battles ★ Record glory ★ Forge legends ★
      </p>
    </div>
  );
}
