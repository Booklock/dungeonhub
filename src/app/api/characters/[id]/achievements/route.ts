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
    return NextResponse.json({ error: "Only DMs can award achievements" }, { status: 403 });
  }

  const { id } = await params;
  const { achievementId, sessionId } = await req.json();

  const award = await prisma.characterAchievement.create({
    data: { characterId: id, achievementId, sessionId: sessionId || null },
    include: { achievement: true },
  });

  return NextResponse.json(award, { status: 201 });
}
