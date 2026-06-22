export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/ui/Navbar";
import { CampaignDetail } from "@/components/campaign/CampaignDetail";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      dm: { select: { id: true, name: true, email: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
      characters: {
        include: {
          user: { select: { id: true, name: true } },
          achievements: { include: { achievement: true } },
        },
      },
      sessions: { orderBy: { date: "desc" } },
    },
  });

  if (!campaign) notFound();

  const userId = session.user.id;
  const isDM = campaign.dmId === userId;
  const isMember = campaign.members.some((m) => m.userId === userId);

  if (!isDM && !isMember) redirect("/dashboard");

  return (
    <>
      <Navbar />
      <CampaignDetail campaign={campaign as unknown as Parameters<typeof CampaignDetail>[0]["campaign"]} currentUserId={userId} isDM={isDM} />
    </>
  );
}
