import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [damageDealt, damageReceived, healingDone, enemiesKilled] = await Promise.all([
    prisma.combatEvent.aggregate({
      where: { sourceType: "PLAYER", sourceId: id, eventType: "DAMAGE" },
      _sum: { amount: true },
    }),
    prisma.combatEvent.aggregate({
      where: { targetType: "PLAYER", targetId: id, eventType: "DAMAGE" },
      _sum: { amount: true },
    }),
    prisma.combatEvent.aggregate({
      where: { sourceType: "PLAYER", sourceId: id, eventType: "HEAL" },
      _sum: { amount: true },
    }),
    prisma.combatEvent.count({
      where: { sourceType: "PLAYER", sourceId: id, isFinalBlow: true },
    }),
  ]);

  return NextResponse.json({
    damageDealt: damageDealt._sum.amount || 0,
    damageReceived: damageReceived._sum.amount || 0,
    healingDone: healingDone._sum.amount || 0,
    enemiesKilled,
  });
}
