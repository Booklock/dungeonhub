export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/ui/Navbar";
import { DMDashboard } from "@/components/campaign/DMDashboard";
import { PlayerDashboard } from "@/components/campaign/PlayerDashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const role = session.user.role;

  if (role === "DM") {
    const campaigns = await prisma.campaign.findMany({
      where: { dmId: userId },
      include: {
        members: { include: { user: { select: { id: true, name: true } } } },
        characters: true,
        sessions: { orderBy: { date: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });

    return (
      <>
        <Navbar />
        <DMDashboard user={session.user} campaigns={campaigns as unknown as Parameters<typeof DMDashboard>[0]["campaigns"]} />
      </>
    );
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

  return (
    <>
      <Navbar />
      <PlayerDashboard user={session.user} campaigns={campaigns as unknown as Parameters<typeof PlayerDashboard>[0]["campaigns"]} />
    </>
  );
}
