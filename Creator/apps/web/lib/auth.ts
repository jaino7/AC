import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@creator/shared";
import { verify } from "argon2";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Google OAuthは一旦スキップ（オプショナル）
const useGoogleAuth = googleClientId && googleClientSecret;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    ...(useGoogleAuth
      ? [
        GoogleProvider({
          clientId: googleClientId!,
          clientSecret: googleClientSecret!
        })
      ]
      : []),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "creator@example.com"
        },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          throw new Error("メールアドレスとパスワードを入力してください。");
        }

        try {
          console.log("Attempting login for:", credentials.email);

          // データベースからユーザーを取得
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          console.log("User found:", user ? "Yes" : "No");

          if (!user || !user.password) {
            console.error("User not found or no password set");
            throw new Error("メールアドレスまたはパスワードが正しくありません");
          }

          console.log("Comparing passwords...");

          // パスワードを検証（argon2）
          const isValidPassword = await verify(
            user.password,
            credentials.password
          );

          console.log("Password valid:", isValidPassword);

          if (!isValidPassword) {
            console.error("Invalid password");
            throw new Error("メールアドレスまたはパスワードが正しくありません");
          }

          console.log("Login successful for:", user.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error("Login error:", error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
  pages: {
    signIn: "/creators/login"
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;

        // Google OAuthまたは新規ユーザーの場合、CreatorProfileを確認・作成
        try {
          // CreatorProfileを取得
          let creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: user.id },
            select: { handle: true }
          });

          // CreatorProfileが存在しない場合は作成（Google OAuth初回登録時）
          if (!creatorProfile && user.email) {
            console.log(`Creating CreatorProfile for user: ${user.email}`);

            // handleを自動生成（emailの@より前 + ランダム数字）
            const emailPrefix = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const randomSuffix = Math.floor(Math.random() * 10000);
            let handle = `${emailPrefix}${randomSuffix}`;

            // ハンドル名の重複チェック
            let handleExists = await prisma.creatorProfile.findUnique({
              where: { handle }
            });

            // 重複していたら再生成
            while (handleExists) {
              const newRandomSuffix = Math.floor(Math.random() * 10000);
              handle = `${emailPrefix}${newRandomSuffix}`;
              handleExists = await prisma.creatorProfile.findUnique({
                where: { handle }
              });
            }

            // CreatorProfileを作成
            creatorProfile = await prisma.creatorProfile.create({
              data: {
                userId: user.id,
                handle: handle,
                displayName: user.name || emailPrefix,
                theme: 'creator-pro'
              },
              select: { handle: true }
            });

            // ユーザーのroleをCREATORに更新
            await prisma.user.update({
              where: { id: user.id },
              data: { role: 'CREATOR' }
            });

            console.log(`Created CreatorProfile with handle: ${handle}`);
          }

          if (creatorProfile) {
            token.handle = creatorProfile.handle;
          }
        } catch (error) {
          console.error("Error handling CreatorProfile in JWT callback:", error);
          // エラーが発生してもトークン生成は継続
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).handle = token.handle;
      }
      return session;
    }
  }
};
