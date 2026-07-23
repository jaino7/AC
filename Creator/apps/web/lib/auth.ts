import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@creator/shared";
import { verify } from "argon2";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const useSecureAuthCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? process.env.NODE_ENV === "production";
const googleOAuthChecks = process.env.NODE_ENV === "development" ? ["none" as const] : ["pkce" as const];

// Google OAuthは一旦スキップ（オプショナル）
const useGoogleAuth = googleClientId && googleClientSecret;

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development', // デバッグモード有効化
  // PrismaAdapterとJWTの併用が問題の可能性があるため、一旦削除
  // adapter: PrismaAdapter(prisma) as any,
  providers: [
    ...(useGoogleAuth
      ? [
        GoogleProvider({
          clientId: googleClientId!,
          clientSecret: googleClientSecret!,
          checks: googleOAuthChecks,
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

          if (!user || !user.password) {
            console.error("User not found or no password set");
            throw new Error("メールアドレスまたはパスワードが正しくありません");
          }

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
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
  // Nginxプロキシ環境向けCookie設定
  // Next.jsはlocalhost:3000(HTTP)で動くため、middlewareはHTTPと認識して
  // プレフィックスなし(next-auth.session-token)を探す
  // → useSecureCookies: false でプレフィックスなし名称を使い両者を一致させる
  useSecureCookies: useSecureAuthCookies,
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureAuthCookies,
      },
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureAuthCookies,
      },
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureAuthCookies,
      },
    },
    pkceCodeVerifier: {
      name: 'next-auth.pkce.code-verifier',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureAuthCookies,
        maxAge: 900,
      },
    },
    state: {
      name: 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureAuthCookies,
        maxAge: 900,
      },
    },
    nonce: {
      name: 'next-auth.nonce',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureAuthCookies,
      },
    },
  },
  // pages: {
  //   signIn: "/creators/login"  // デフォルトのサインインページを強制しない
  // },
  callbacks: {
    async redirect({ url, baseUrl }) {
      const parsedUrl = new URL(url, baseUrl);
      const state = parsedUrl.searchParams.get("state");

      if (state) {
        try {
          const callbackUrl = Buffer.from(state, "base64").toString("utf8");
          const parsedCallbackUrl = new URL(callbackUrl, baseUrl);

          if (parsedCallbackUrl.origin === baseUrl) {
            return parsedCallbackUrl.toString();
          }
        } catch {
          // Fall through to the default redirect behavior.
        }
      }

      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (parsedUrl.origin === baseUrl) return url;
      return baseUrl;
    },
    async signIn({ user, account, profile }) {
      // Google認証の場合、ユーザーをDBに作成または取得
      if (account?.provider === "google" && user.email) {
        try {
          // ユーザーが既に存在するか確認
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          // 存在しない場合は作成（デフォルトはUSER、クリエイター登録は別途行う）
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || user.email.split('@')[0],
                emailVerified: new Date(),
                image: user.image,
                role: 'USER' // デフォルトはファンユーザーとして登録
              }
            });
            console.log(`Created user via Google OAuth: ${dbUser.email}`);
          }

          // userオブジェクトにidを設定（JWTコールバックで使用）
          user.id = dbUser.id;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      // 最終ログイン時間を更新
      const userId = user?.id;
      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { lastLoginAt: new Date() },
        }).catch((err) => console.error("Failed to update lastLoginAt:", err));
      }

      return true;
    },
    async jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }

      // セッション更新時にnameとimageを更新
      if (trigger === "update" && updateData) {
        if (updateData.name) token.name = updateData.name;
        if (updateData.image) token.image = updateData.image;
      }

      // 常に最新のCreatorProfileを取得してhandleを更新
      if (token.id) {
        try {
          const creatorProfile = await prisma.creatorProfile.findUnique({
            where: { userId: token.id as string },
            select: { handle: true }
          });

          if (creatorProfile) {
            token.handle = creatorProfile.handle;
          } else {
            // CreatorProfileが存在しない場合はhandleをクリア
            token.handle = undefined;
          }
        } catch (error) {
          console.error("Error fetching CreatorProfile in JWT callback:", error);
        }
      }

      // NOTE: CreatorProfileの自動作成ロジックは無効化しました。
      // ファン登録時にもCreatorProfileが作成されてしまい、roleがCREATORに設定される問題があるため。
      // 必要に応じて各ページ（dashboard/page.tsxなど）でFanProfileまたはCreatorProfileを作成します。
      /*
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
      */
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).handle = token.handle;
        (session.user as any).name = token.name;
        (session.user as any).email = token.email;
        (session.user as any).image = token.image;
      }
      return session;
    }
  }
};
