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
  const character = await prisma.character.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true } },
      campaign: { select: { id: true, name: true } },
      achievements: { include: { achievement: true, session: { select: { id: true, title: true } } } },
      notes: { include: { session: { select: { id: true, title: true } } }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(character);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const data = await req.json();

  const updated = await prisma.character.update({
    where: { id },
    data: {
      name: data.name,
      class: data.class,
      level: data.level !== undefined ? parseInt(data.level) : undefined,
      xp: data.xp !== undefined ? parseInt(data.xp) : undefined,
      baseHealth: data.baseHealth !== undefined ? parseInt(data.baseHealth) : undefined,
      avatarSeed: data.avatarSeed,
    },
  });

  return NextResponse.json(updated);
}
