import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { members: true },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userId = session.user.id;
  const role = session.user.role;
  const isDM = campaign.dmId === userId;
  const isMember = campaign.members.some((m) => m.userId === userId);

  if (!isDM && !isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, charClass, level, xp, baseHealth, avatarSeed, targetUserId } = await req.json();
  if (!name || !charClass) return NextResponse.json({ error: "Name and class required" }, { status: 400 });

  const ownerUserId = role === "DM" && targetUserId ? targetUserId : userId;

  const character = await prisma.character.create({
    data: {
      name,
      class: charClass,
      level: level || 1,
      xp: xp || 0,
      baseHealth: baseHealth || 10,
      avatarSeed: avatarSeed || name,
      userId: ownerUserId,
      campaignId: id,
    },
  });

  return NextResponse.json(character, { status: 201 });
}
