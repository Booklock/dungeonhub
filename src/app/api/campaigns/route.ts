import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const role = session.user.role;

  if (role === "DM") {
    const campaigns = await prisma.campaign.findMany({
      where: { dmId: userId },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        characters: true,
        sessions: { orderBy: { date: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(campaigns);
  }

  const campaigns = await prisma.campaign.findMany({
    where: { members: { some: { userId } } },
    include: {
      dm: { select: { id: true, name: true } },
      members: { include: { user: { select: { id: true, name: true } } } },
      characters: { where: { userId } },
      sessions: { orderBy: { date: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(campaigns);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "DM") {
    return NextResponse.json({ error: "Only DMs can create campaigns" }, { status: 403 });
  }

  const { name, description, nextSessionDate, nextSessionType } = await req.json();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const campaign = await prisma.campaign.create({
    data: {
      name,
      description,
      dmId: session.user.id,
      nextSessionDate: nextSessionDate ? new Date(nextSessionDate) : null,
      nextSessionType,
    },
  });

  return NextResponse.json(campaign, { status: 201 });
}
