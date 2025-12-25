import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { hash, verify } from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCreatorDto } from "./dto/create-creator.dto";
import { LoginCreatorDto } from "./dto/login-creator.dto";

type CreatorResponse = {
  id: string;
  email: string;
  verified: boolean;
  createdAt?: Date;
};

@Injectable()
export class CreatorsService {
  constructor(private readonly prisma: PrismaService) { }

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
    const user = await this.prisma.$transaction(async (prisma) => {
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
      await prisma.creatorProfile.create({
        data: {
          userId: newUser.id,
          handle: handle,
          displayName: emailPrefix,
          theme: 'creator-pro'
        }
      });

      return newUser;
    });

    if (!user.email) {
      throw new Error("User created without email");
    }

    return this.toCreatorResponse({
      ...user,
      email: user.email
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
        createdAt: true
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
      ...user,
      email: user.email
    });
  }

  private toCreatorResponse(user: {
    id: string;
    email: string;
    emailVerified: Date | null;
    createdAt?: Date;
  }): CreatorResponse {
    return {
      id: user.id,
      email: user.email,
      verified: Boolean(user.emailVerified),
      createdAt: user.createdAt
    };
  }
}
