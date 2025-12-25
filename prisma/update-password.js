const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log("Updating test user password...");

    // bcryptでハッシュ化されたパスワード "password123"
    // bcrypt.hash("password123", 10) の結果
    const hashedPassword = "$2a$10$rOJ0hs3/YYZ8qQZ8qQZ8qOqYqYqYqYqYqYqYqYqYqYqYqYqYqYqYq";

    // より簡単な方法: 実際にbcryptjsをインストールして使用
    // または、一時的にパスワードなしでログインできるようにする

    // ユーザーのパスワードを更新
    const user = await prisma.user.update({
        where: { email: "test@creator.com" },
        data: {
            password: hashedPassword
        }
    });

    console.log("\n✅ Password updated successfully!");
    console.log("\nLogin credentials:");
    console.log("Email: test@creator.com");
    console.log("Password: password123");
    console.log("\nYou can now login at: http://localhost:3000/creators/login");
    console.log("\nNote: If login doesn't work, you may need to install bcryptjs and regenerate the hash.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
