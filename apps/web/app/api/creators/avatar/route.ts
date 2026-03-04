import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@creator/shared";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("avatar") as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // Validate file type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5MB." },
                { status: 400 }
            );
        }

        // Get user's creator profile
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { creatorProfile: true }
        });

        if (!user?.creatorProfile) {
            return NextResponse.json(
                { error: "Creator profile not found" },
                { status: 404 }
            );
        }

        // Create unique filename
        const timestamp = Date.now();
        const ext = file.name.split(".").pop();
        const filename = `avatar-${user.creatorProfile.id}-${timestamp}.${ext}`;

        // Upload directory path
        const uploadDir = join(process.cwd(), "public", "uploads", "avatars");

        // Create directory if it doesn't exist
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Public URL
        const avatarUrl = `/uploads/avatars/${filename}`;

        // Update creator profile
        await prisma.creatorProfile.update({
            where: { id: user.creatorProfile.id },
            data: { avatarUrl }
        });

        return NextResponse.json({
            success: true,
            avatarUrl
        });
    } catch (error) {
        console.error("Avatar upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload avatar" },
            { status: 500 }
        );
    }
}
