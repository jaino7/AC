import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@creator/shared";

export default async function SettingsRedirectPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/creators/login");
    }

    const creator = await prisma.creatorProfile.findFirst({
        where: { user: { email: session.user.email } },
        select: { handle: true },
    });

    if (!creator) {
        redirect("/creators/dashboard");
    }

    redirect(`/creators/${creator.handle}/settings`);
}
