import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const achievements = await prisma.achievement.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(achievements);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "DM") {
    return NextResponse.json({ error: "Only DMs can create achievements" }, { status: 403 });
  }

  const { name, description, icon, type } = await req.json();
  if (!name || !description) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const achievement = await prisma.achievement.create({
    data: { name, description, icon: icon || "trophy", type: type || "MANUAL" },
  });

  return NextResponse.json(achievement, { status: 201 });
}
