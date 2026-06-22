import { PrismaClient } from "@prisma/client";
import path from "path";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrisma(): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaLibSql } = require("@prisma/adapter-libsql");

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  // Production: use Turso cloud database
  if (tursoUrl && tursoUrl.startsWith("libsql://")) {
    const adapter = new PrismaLibSql({ url: tursoUrl, authToken: tursoToken });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new PrismaClient({ adapter } as any);
  }

  // Development: use local SQLite file
  const localUrl = tursoUrl || `file://${path.resolve(process.cwd(), "dev.db")}`;
  const adapter = new PrismaLibSql({ url: localUrl });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

export const prisma = globalThis.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
