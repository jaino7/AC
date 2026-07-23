import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@creator/shared";

export default async function PreviewPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/creators/login");
  }

  // Get user and creator profile
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      creatorProfile: {
        select: {
          theme: true,
          handle: true,
        },
      },
    },
  });

  if (!user?.creatorProfile) {
    redirect("/creators/signup");
  }

  const { theme, handle } = user.creatorProfile;

  // Redirect to the appropriate theme page with preview mode
  redirect(`/${theme}/content?preview=true&handle=${handle}`);
}
