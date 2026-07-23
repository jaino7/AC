import { prisma } from "@creator/shared";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LocalContentRedirectPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const creator = await prisma.creatorProfile.findFirst({
    orderBy: { createdAt: "asc" },
    select: { handle: true },
  });

  if (!creator) {
    notFound();
  }

  redirect(`/${creator.handle}/content`);
}
