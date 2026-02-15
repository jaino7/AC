import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@creator/shared";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId");
    const creatorHandle = searchParams.get("creatorHandle");

    if (!userId || !creatorHandle) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    // Get creator profile
    const creatorProfile = await prisma.creatorProfile.findUnique({
      where: { handle: creatorHandle },
      select: { id: true },
    });

    if (!creatorProfile) {
      return NextResponse.json({ isLocked: false });
    }

    // Check if fan profile is locked
    const fanProfile = await prisma.fanProfile.findUnique({
      where: {
        userId_creatorId: {
          userId,
          creatorId: creatorProfile.id,
        },
      },
      select: { isLocked: true },
    });

    return NextResponse.json({
      isLocked: fanProfile?.isLocked || false,
    });
  } catch (error) {
    console.error("Error checking lock status:", error);
    return NextResponse.json(
      { error: "Internal server error", isLocked: false },
      { status: 500 }
    );
  }
}
