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
  const sessions = await prisma.session.findMany({
    where: { campaignId: id },
    include: {
      creatures: true,
      combatEvents: true,
      playerNotes: true,
      characterAchievements: { include: { achievement: true, character: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(sessions);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "DM") {
    return NextResponse.json({ error: "Only DMs can create sessions" }, { status: 403 });
  }

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id } });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (campaign.dmId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, date, notes } = await req.json();
  if (!title || !date) return NextResponse.json({ error: "Title and date required" }, { status: 400 });

  const gameSession = await prisma.session.create({
    data: { campaignId: id, title, date: new Date(date), notes },
  });

  return NextResponse.json(gameSession, { status: 201 });
}
