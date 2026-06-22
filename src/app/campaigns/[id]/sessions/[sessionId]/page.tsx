export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/ui/Navbar";
import { SessionDetail } from "@/components/session/SessionDetail";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id: campaignId, sessionId } = await params;

  const gameSession = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      campaign: {
        include: {
          dm: { select: { id: true, name: true } },
          characters: {
            include: { user: { select: { id: true, name: true } } },
          },
        },
      },
      creatures: true,
      combatEvents: { orderBy: { createdAt: "asc" } },
      playerNotes: {
        include: { character: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      characterAchievements: {
        include: {
          achievement: true,
          character: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!gameSession) notFound();
  if (gameSession.campaignId !== campaignId) notFound();

  const userId = session.user.id;
  const isDM = gameSession.campaign.dmId === userId;

  return (
    <>
      <Navbar />
      <SessionDetail
        gameSession={gameSession as unknown as Parameters<typeof SessionDetail>[0]["gameSession"]}
        currentUserId={userId}
        isDM={isDM}
        campaignId={campaignId}
      />
    </>
  );
}
