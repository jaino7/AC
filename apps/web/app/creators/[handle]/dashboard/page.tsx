import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import { prisma } from "@creator/shared";

export default async function DashboardPage({ params }: { params: { handle: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/creators/login");
  }

  // Get creatorId from creatorProfile
  const userId = (session.user as any).id;

  console.log("Dashboard - userId:", userId);

  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { userId },
    select: { id: true }
  });

  console.log("Dashboard - creatorProfile:", creatorProfile);

  if (!creatorProfile) {
    console.log("Dashboard - No creatorProfile found, redirecting to signup");
    redirect("/creators/signup");
  }

  const creatorId = creatorProfile.id;
  console.log("Dashboard - creatorId:", creatorId);

  return <DashboardClient creatorId={creatorId} />;
}
