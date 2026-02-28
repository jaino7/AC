"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var CreatorsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorsService = void 0;
const common_1 = require("@nestjs/common");
const argon2_1 = require("argon2");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
let CreatorsService = CreatorsService_1 = class CreatorsService {
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.logger = new common_1.Logger(CreatorsService_1.name);
    }
    async create(payload) {
        if (payload.password !== payload.confirmPassword) {
            throw new common_1.BadRequestException("パスワードが一致しません");
        }
        if (!payload.acceptTerms || !payload.confirmAdult) {
            throw new common_1.BadRequestException("必須の同意が確認できません");
        }
        const existing = await this.prisma.user.findUnique({
            where: { email: payload.email }
        });
        if (existing) {
            throw new common_1.ConflictException("既に登録済みのメールアドレスです");
        }
        const passwordHash = await (0, argon2_1.hash)(payload.password);
        const generateHandle = () => {
            const letters = Array.from({ length: 3 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
            const digits = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
            return `${letters}${digits}`;
        };
        let handle = generateHandle();
        let handleExists = await this.prisma.creatorProfile.findUnique({
            where: { handle }
        });
        while (handleExists) {
            handle = generateHandle();
            handleExists = await this.prisma.creatorProfile.findUnique({
                where: { handle }
            });
        }
        const result = await this.prisma.$transaction(async (prisma) => {
            const newUser = await prisma.user.create({
                data: {
                    email: payload.email,
                    name: payload.email.split('@')[0],
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
            const creatorProfile = await prisma.creatorProfile.create({
                data: {
                    userId: newUser.id,
                    handle: handle,
                    displayName: payload.email.split('@')[0],
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
        this.mailService.sendWelcomeEmail(result.user.email, {
            userType: 'creator',
            name: 'クリエイター',
            email: result.user.email,
            handle: result.handle,
        }, result.user.id).catch((err) => {
            this.logger.error(`Failed to send welcome email to ${result.user.email}: ${err.message}`);
        });
        return this.toCreatorResponse(Object.assign(Object.assign({}, result.user), { email: result.user.email, handle: result.handle }));
    }
    async login(payload) {
        var _a;
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
            throw new common_1.UnauthorizedException("メールアドレスまたはパスワードが違います");
        }
        const ok = await (0, argon2_1.verify)(user.password, payload.password);
        if (!ok) {
            throw new common_1.UnauthorizedException("メールアドレスまたはパスワードが違います");
        }
        if (!user.email) {
            throw new Error("User found without email");
        }
        return this.toCreatorResponse({
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
            handle: (_a = user.creatorProfile) === null || _a === void 0 ? void 0 : _a.handle,
            createdAt: user.createdAt
        });
    }
    toCreatorResponse(user) {
        return {
            id: user.id,
            email: user.email,
            verified: Boolean(user.emailVerified),
            handle: user.handle,
            createdAt: user.createdAt
        };
    }
    async changePassword(payload) {
        if (payload.newPassword !== payload.confirmPassword) {
            throw new common_1.BadRequestException("新しいパスワードが一致しません");
        }
        const user = await this.prisma.user.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                password: true
            }
        });
        if (!user || !user.password) {
            throw new common_1.UnauthorizedException("ユーザーが見つかりません");
        }
        const isValid = await (0, argon2_1.verify)(user.password, payload.currentPassword);
        if (!isValid) {
            throw new common_1.UnauthorizedException("現在のパスワードが正しくありません");
        }
        const newPasswordHash = await (0, argon2_1.hash)(payload.newPassword);
        await this.prisma.user.update({
            where: { id: payload.userId },
            data: { password: newPasswordHash }
        });
        return { message: "パスワードを変更しました" };
    }
    async updateProfile(payload) {
        if (payload.name !== undefined) {
            await this.prisma.user.update({
                where: { id: payload.userId },
                data: { name: payload.name }
            });
        }
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
    async findCreatorByUserId(userId) {
        return this.prisma.creatorProfile.findUnique({
            where: { userId },
            select: {
                id: true,
                handle: true,
                displayName: true,
            },
        });
    }
    async requestPasswordReset(payload) {
        const user = await this.prisma.user.findUnique({
            where: { email: payload.email },
            select: { id: true, email: true }
        });
        if (!user || !user.email) {
            return { message: 'パスワード再設定用のメールを送信しました（登録済みの場合）' };
        }
        await this.prisma.passwordResetToken.updateMany({
            where: { userId: user.id, usedAt: null },
            data: { usedAt: new Date() }
        });
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.prisma.passwordResetToken.create({
            data: { userId: user.id, token, expiresAt }
        });
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/creators/password-reset/confirm?token=${token}`;
        this.mailService.sendPasswordResetEmail(user.email, { userType: 'creator', name: 'クリエイター', resetUrl }, user.id).catch((err) => {
            this.logger.error(`Failed to send password reset email to ${user.email}: ${err.message}`);
        });
        return { message: 'パスワード再設定用のメールを送信しました（登録済みの場合）' };
    }
    async confirmPasswordReset(payload) {
        if (payload.newPassword !== payload.confirmPassword) {
            throw new common_1.BadRequestException('新しいパスワードが一致しません');
        }
        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { token: payload.token },
            select: { id: true, userId: true, expiresAt: true, usedAt: true }
        });
        if (!resetToken || resetToken.usedAt) {
            throw new common_1.BadRequestException('無効または使用済みのトークンです');
        }
        if (resetToken.expiresAt < new Date()) {
            throw new common_1.BadRequestException('トークンの有効期限が切れています');
        }
        const newPasswordHash = await (0, argon2_1.hash)(payload.newPassword);
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
};
exports.CreatorsService = CreatorsService;
exports.CreatorsService = CreatorsService = CreatorsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], CreatorsService);
//# sourceMappingURL=creators.service.js.map