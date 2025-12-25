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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorsService = void 0;
const common_1 = require("@nestjs/common");
const argon2_1 = require("argon2");
const prisma_service_1 = require("../prisma/prisma.service");
let CreatorsService = class CreatorsService {
    constructor(prisma) {
        this.prisma = prisma;
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
        const user = await this.prisma.user.create({
            data: {
                email: payload.email,
                password: passwordHash,
                emailVerified: new Date()
            },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                createdAt: true
            }
        });
        if (!user.email) {
            throw new Error("User created without email");
        }
        return this.toCreatorResponse(Object.assign(Object.assign({}, user), { email: user.email }));
    }
    async login(payload) {
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
            throw new common_1.UnauthorizedException("メールアドレスまたはパスワードが違います");
        }
        const ok = await (0, argon2_1.verify)(user.password, payload.password);
        if (!ok) {
            throw new common_1.UnauthorizedException("メールアドレスまたはパスワードが違います");
        }
        if (!user.email) {
            throw new Error("User found without email");
        }
        return this.toCreatorResponse(Object.assign(Object.assign({}, user), { email: user.email }));
    }
    toCreatorResponse(user) {
        return {
            id: user.id,
            email: user.email,
            verified: Boolean(user.emailVerified),
            createdAt: user.createdAt
        };
    }
};
exports.CreatorsService = CreatorsService;
exports.CreatorsService = CreatorsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreatorsService);
//# sourceMappingURL=creators.service.js.map