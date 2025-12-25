const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    console.log("Setting password for test@creator.com...");

    // "password123" をbcryptでハッシュ化
    const hashedPassword = await bcrypt.hash("password123", 10);

    console.log("Generated hash:", hashedPassword);

    // ユーザーのパスワードを更新
    const user = await prisma.user.update({
        where: { email: "test@creator.com" },
        data: {
            password: hashedPassword
        }
    });

    console.log("\n✅ Password set successfully!");
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    test@creator.com");
    console.log("🔑 Password: password123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🌐 Login at: http://localhost:3000/creators/login");
    console.log("\nYou can now login and view your dashboard!");
}

main()
    .catch((e) => {
        console.error("Error:", e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
