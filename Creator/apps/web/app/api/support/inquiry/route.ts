import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";

export async function POST(req: NextRequest) {
  try {
    console.log("[Ban Inquiry] Request received");

    const session = await getServerSession(authOptions);
    console.log("[Ban Inquiry] Session:", session ? "Found" : "Not found");

    if (!session?.user?.email) {
      console.error("[Ban Inquiry] No session or email");
      return NextResponse.json(
        { error: "認証が必要です。ログインしてください。" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    console.log("[Ban Inquiry] User ID:", userId);

    const body = await req.json();
    const { name, email, transferDetails, message } = body;
    console.log("[Ban Inquiry] Form data:", { name, email, transferDetails: transferDetails?.substring(0, 50) });

    // Validate required fields
    if (!name || !email || !transferDetails || !message) {
      console.error("[Ban Inquiry] Missing required fields");
      return NextResponse.json(
        { error: "必須項目が不足しています" },
        { status: 400 }
      );
    }

    // Get user's fan profile with tier and trust score
    // Find the locked fan profile (if multiple profiles exist, prioritize locked ones)
    const fanProfile = await prisma.fanProfile.findFirst({
      where: {
        userId,
        isLocked: true  // Only get locked profiles
      },
      select: {
        id: true,
        tier: true,
        trustScore: true,
        isLocked: true,
        creatorId: true,
      },
    });

    console.log("[Ban Inquiry] FanProfile:", fanProfile ? `Found (ID: ${fanProfile.id})` : "Not found");

    if (!fanProfile) {
      console.error("[Ban Inquiry] FanProfile not found or not locked for user:", userId);
      return NextResponse.json(
        { error: "ロックされたアカウントが見つかりません。" },
        { status: 404 }
      );
    }

    // Get API URL from environment
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const adminBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const adminLink = `${adminBaseUrl}/admin/fans/${fanProfile.id}`;

    // Send Discord notification via backend API
    console.log("[Ban Inquiry] Sending Discord notification to:", `${apiUrl}/notifications/ban-inquiry`);
    try {
      const response = await fetch(`${apiUrl}/notifications/ban-inquiry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          fanProfileId: fanProfile.id,
          name,
          email,
          tier: fanProfile.tier,
          trustScore: fanProfile.trustScore,
          transferDetails,
          message,
          adminLink,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Ban Inquiry] Discord notification failed:", response.status, errorText);
        // Continue anyway - don't fail the whole request
      } else {
        console.log("[Ban Inquiry] Discord notification sent successfully");
      }
    } catch (error) {
      console.error("[Ban Inquiry] Error sending Discord notification:", error);
      // Continue anyway - don't fail the whole request
    }

    // TODO: Also send email notification to support@cocoba.jp

    console.log("[Ban Inquiry] Request completed successfully");
    return NextResponse.json({
      success: true,
      message: "お問い合わせを受け付けました",
    });
  } catch (error) {
    console.error("[Ban Inquiry] Inquiry submission error:", error);
    const errorMessage = error instanceof Error ? error.message : "送信に失敗しました";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
