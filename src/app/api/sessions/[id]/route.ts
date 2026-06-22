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
  const gameSession = await prisma.session.findUnique({
    where: { id },
    include: {
      campaign: { include: { dm: { select: { id: true, name: true } }, characters: { include: { user: { select: { id: true, name: true } } } } } },
      creatures: true,
      combatEvents: { orderBy: { createdAt: "asc" } },
      playerNotes: { include: { character: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } },
      characterAchievements: { include: { achievement: true, character: { select: { id: true, name: true } } } },
    },
  });

  if (!gameSession) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(gameSession);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const updated = await prisma.session.update({
    where: { id },
    data: {
      title: data.title,
      notes: data.notes,
      status: data.status,
      date: data.date ? new Date(data.date) : undefined,
    },
  });

  return NextResponse.json(updated);
}
