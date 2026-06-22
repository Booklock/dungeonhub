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
    return NextResponse.json({ error: "Only DMs can log combat events" }, { status: 403 });
  }

  const { id } = await params;
  const { eventType, sourceType, sourceId, targetType, targetId, amount, isFinalBlow } = await req.json();

  if (!eventType || !sourceId || !targetId || amount === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const event = await prisma.combatEvent.create({
    data: {
      sessionId: id,
      eventType,
      sourceType,
      sourceId,
      targetType,
      targetId,
      amount: parseInt(amount),
      isFinalBlow: isFinalBlow || false,
    },
  });

  return NextResponse.json(event, { status: 201 });
}

export async function DELETE(
  req: NextRequest,

) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { eventId } = await req.json();
  await prisma.combatEvent.delete({ where: { id: eventId } });
  return NextResponse.json({ success: true });
}
