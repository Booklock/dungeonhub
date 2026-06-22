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
  const { characterId, content } = await req.json();
  if (!characterId || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const note = await prisma.playerNote.create({
    data: { sessionId: id, characterId, content },
  });

  return NextResponse.json(note, { status: 201 });
}

export async function DELETE(
  req: NextRequest,

) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await req.json();
  await prisma.playerNote.delete({ where: { id: noteId } });
  return NextResponse.json({ success: true });
}
