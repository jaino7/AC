import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException
} from "@nestjs/common";
import { hash, verify } from "argon2";
import { randomBytes } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { CreateCreatorDto } from "./dto/create-creator.dto";
import { LoginCreatorDto } from "./dto/login-creator.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { PasswordResetRequestDto } from "./dto/password-reset-request.dto";
import { PasswordResetConfirmDto } from "./dto/password-reset-confirm.dto";

type CreatorResponse = {
  id: string;
  email: string;
  verified: boolean;
  handle?: string;
  createdAt?: Date;
};

@Injectable()
export class CreatorsService {
  private readonly logger = new Logger(CreatorsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) { }

  async create(payload: CreateCreatorDto): Promise<CreatorResponse> {
    if (payload.password !== payload.confirmPassword) {
      throw new BadRequestException("パスワードが一致しません");
    }

    if (!payload.acceptTerms || !payload.confirmAdult) {
      throw new BadRequestException("必須の同意が確認できません");
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: payload.email }
    });
    if (existing) {
      throw new ConflictException("既に登録済みのメールアドレスです");
    }

    const passwordHash = await hash(payload.password);

    // ハンドル名の生成（完全ランダム: 英小文字3文字 + 数字5桁）
    const generateHandle = () => {
      const letters = Array.from({ length: 3 }, () =>
        String.fromCharCode(97 + Math.floor(Math.random() * 26))
      ).join('');
      const digits = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
      return `${letters}${digits}`;
    };

    let handle = generateHandle();

    // ハンドル名の重複チェック
    let handleExists = await this.prisma.creatorProfile.findUnique({
      where: { handle }
    });

    // 重複していたら再生成
    while (handleExists) {
      handle = generateHandle();
      handleExists = await this.prisma.creatorProfile.findUnique({
        where: { handle }
      });
    }

    // トランザクションでUserとCreatorProfileを同時に作成
    const result = await this.prisma.$transaction(async (prisma) => {
      // Userを作成
      const newUser = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.email.split('@')[0], // 初期表示名としてセット
          password: passwordHash,
          emailVerified: new Date(),
          role: 'CREATOR'
        },
        select: {
          id: true,
          email: true,
          emailVerified: true,
          createdAt: true
        }
      });

      // CreatorProfileを作成
      const creatorProfile = await prisma.creatorProfile.create({
        data: {
          userId: newUser.id,
          handle: handle,
          displayName: payload.email.split('@')[0], // 'クリエイター' からメールプレフィックスに変更
          theme: 'creator-pro'
        },
        select: {
          handle: true
        }
      });

      return { user: newUser, handle: creatorProfile.handle };
    });

    if (!result.user.email) {
      throw new Error("User created without email");
    }

    // Send welcome email (non-blocking - email failure should not fail signup)
    this.mailService.sendWelcomeEmail(
      result.user.email,
      {
        userType: 'creator',
        name: 'クリエイター',
        email: result.user.email,
        handle: result.handle,
      },
      result.user.id,
    ).catch((err) => {
      this.logger.error(`Failed to send welcome email to ${result.user.email}: ${err.message}`);
    });

    return this.toCreatorResponse({
      ...result.user,
      email: result.user.email,
      handle: result.handle
    });
  }

  async login(payload: LoginCreatorDto): Promise<CreatorResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        email: true,
        password: true,
        emailVerified: true,
        createdAt: true,
        creatorProfile: {
          select: {
            handle: true
          }
        }
      }
    });

    if (!user || !user.password) {
      throw new UnauthorizedException("メールアドレスまたはパスワードが違います");
    }

    const ok = await verify(user.password, payload.password);
    if (!ok) {
      throw new UnauthorizedException("メールアドレスまたはパスワードが違います");
    }

    if (!user.email) {
      throw new Error("User found without email");
    }

    return this.toCreatorResponse({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      handle: user.creatorProfile?.handle,
      createdAt: user.createdAt
    });
  }

  private toCreatorResponse(user: {
    id: string;
    email: string;
    emailVerified: Date | null;
    handle?: string;
    createdAt?: Date;
  }): CreatorResponse {
    return {
      id: user.id,
      email: user.email,
      verified: Boolean(user.emailVerified),
      handle: user.handle,
      createdAt: user.createdAt
    };
  }

  async changePassword(payload: ChangePasswordDto): Promise<{ message: string }> {
    if (payload.newPassword !== payload.confirmPassword) {
      throw new BadRequestException("新しいパスワードが一致しません");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        password: true
      }
    });

    if (!user || !user.password) {
      throw new UnauthorizedException("ユーザーが見つかりません");
    }

    const isValid = await verify(user.password, payload.currentPassword);
    if (!isValid) {
      throw new UnauthorizedException("現在のパスワードが正しくありません");
    }

    const newPasswordHash = await hash(payload.newPassword);

    await this.prisma.user.update({
      where: { id: payload.userId },
      data: { password: newPasswordHash }
    });

    return { message: "パスワードを変更しました" };
  }

  async updateProfile(payload: UpdateProfileDto): Promise<{ message: string }> {
    // Userのname更新
    if (payload.name !== undefined) {
      await this.prisma.user.update({
        where: { id: payload.userId },
        data: { name: payload.name }
      });
    }

    // CreatorProfileのdisplayName更新（存在する場合）
    if (payload.displayName !== undefined) {
      const creatorProfile = await this.prisma.creatorProfile.findUnique({
        where: { userId: payload.userId }
      });

      if (creatorProfile) {
        await this.prisma.creatorProfile.update({
          where: { userId: payload.userId },
          data: { displayName: payload.displayName }
        });
      }
    }

    return { message: "プロフィールを更新しました" };
  }

  async findCreatorByUserId(userId: string) {
    return this.prisma.creatorProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        handle: true,
        displayName: true,
      },
    });
  }

  async requestPasswordReset(payload: PasswordResetRequestDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true, email: true }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'パスワード再設定用のメールを送信しました（登録済みの場合）' };
    }

    // Invalidate existing unused tokens
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() }
    });

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt }
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/creators/password-reset/confirm?token=${token}`;

    this.mailService.sendPasswordResetEmail(
      user.email,
      { userType: 'creator', name: 'クリエイター', resetUrl },
      user.id
    ).catch((err) => {
      this.logger.error(`Failed to send password reset email to ${user.email}: ${err.message}`);
    });

    return { message: 'パスワード再設定用のメールを送信しました（登録済みの場合）' };
  }

  async confirmPasswordReset(payload: PasswordResetConfirmDto): Promise<{ message: string }> {
    if (payload.newPassword !== payload.confirmPassword) {
      throw new BadRequestException('新しいパスワードが一致しません');
    }

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: payload.token },
      select: { id: true, userId: true, expiresAt: true, usedAt: true }
    });

    if (!resetToken || resetToken.usedAt) {
      throw new BadRequestException('無効または使用済みのトークンです');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new BadRequestException('トークンの有効期限が切れています');
    }

    const newPasswordHash = await hash(payload.newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: newPasswordHash }
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() }
      })
    ]);

    return { message: 'パスワードを変更しました' };
  }
}
