import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const creators = await prisma.creatorProfile.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        displayName: true,
        handle: true,
        createdAt: true,
        user: {
          select: {
            email: true,
          },
        },
        identityVerification: {
          select: {
            status: true,
          },
        },
      },
    });

    const result = creators.map((c) => ({
      id: c.id,
      displayName: c.displayName,
      handle: c.handle,
      email: c.user.email,
      createdAt: c.createdAt,
      verificationStatus: c.identityVerification?.status ?? null,
    }));

    return NextResponse.json({ creators: result });
  } catch (error) {
    console.error("Error fetching creators:", error);
    return NextResponse.json({ error: "取得に失敗しました" }, { status: 500 });
  }
}
