"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role;

  if (!session) return null;

  return (
    <nav
      style={{
        background: "var(--dungeon-surface)",
        borderBottom: "3px solid var(--dungeon-border)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Link href="/dashboard" style={{ textDecoration: "none" }}>
        <span style={{ fontSize: 14, color: "var(--dungeon-gold)", fontWeight: "bold" }}>
          ⚔️ DungeonHub
        </span>
      </Link>

      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <Link
          href="/dashboard"
          style={{
            fontSize: 8,
            color: pathname === "/dashboard" ? "var(--dungeon-gold)" : "var(--dungeon-text-dim)",
            textDecoration: "none",
          }}
        >
          Dashboard
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className={`pixel-badge ${role === "DM" ? "badge-dm" : "badge-player"}`}>
            {role === "DM" ? "👑 DM" : "🎲 Player"}
          </span>
          <span style={{ fontSize: 8, color: "var(--dungeon-text-dim)" }}>
            {session.user?.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="pixel-btn pixel-btn-ghost"
            style={{ fontSize: 7, padding: "6px 10px" }}
          >
            Exit
          </button>
        </div>
      </div>
    </nav>
  );
}
