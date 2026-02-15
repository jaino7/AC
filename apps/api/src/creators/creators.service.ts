import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { hash, verify } from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { MailService } from "../mail/mail.service";
import { CreateCreatorDto } from "./dto/create-creator.dto";
import { LoginCreatorDto } from "./dto/login-creator.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

type CreatorResponse = {
  id: string;
  email: string;
  verified: boolean;
  handle?: string;
  createdAt?: Date;
};

@Injectable()
export class CreatorsService {
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

    // ハンドル名の生成（emailの@より前 + ランダム数字）
    const emailPrefix = payload.email.split('@')[0].toLowerCase();
    const randomSuffix = Math.floor(Math.random() * 10000);
    let handle = `${emailPrefix}${randomSuffix}`;

    // ハンドル名の重複チェック
    let handleExists = await this.prisma.creatorProfile.findUnique({
      where: { handle }
    });

    // 重複していたら再生成
    while (handleExists) {
      const newRandomSuffix = Math.floor(Math.random() * 10000);
      handle = `${emailPrefix}${newRandomSuffix}`;
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
          displayName: emailPrefix,
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

    // Send welcome email
    await this.mailService.sendWelcomeEmail(
      result.user.email,
      {
        userType: 'creator',
        name: emailPrefix,
        email: result.user.email,
        handle: result.handle,
      },
      result.user.id,
    );

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
}
