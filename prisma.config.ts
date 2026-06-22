import "dotenv/config";
import { defineConfig } from "prisma/config";

// In production, TURSO_DATABASE_URL is like: libsql://your-db.turso.io
// In development, fall back to the local SQLite file
const url = process.env.TURSO_DATABASE_URL?.startsWith("libsql://")
  ? process.env.TURSO_DATABASE_URL
  : process.env.DATABASE_URL ?? "file:./dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url,
    // authToken is required when connecting to Turso cloud
    ...(process.env.TURSO_AUTH_TOKEN && {
      authToken: process.env.TURSO_AUTH_TOKEN,
    }),
  },
});
