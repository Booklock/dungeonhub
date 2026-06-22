import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "DM") {
    return NextResponse.json({ error: "Only DMs can add creatures" }, { status: 403 });
  }

  const { id } = await params;
  const { name, maxHp } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const creature = await prisma.creature.create({
    data: { sessionId: id, name, maxHp: maxHp || 10 },
  });

  return NextResponse.json(creature, { status: 201 });
}

export async function DELETE(
  req: NextRequest,

) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { creatureId } = await req.json();
  await prisma.creature.delete({ where: { id: creatureId } });
  return NextResponse.json({ success: true });
}
