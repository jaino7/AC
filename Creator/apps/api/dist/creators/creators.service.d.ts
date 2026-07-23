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
export declare class CreatorsService {
    private readonly prisma;
    private readonly mailService;
    private readonly logger;
    constructor(prisma: PrismaService, mailService: MailService);
    create(payload: CreateCreatorDto): Promise<CreatorResponse>;
    login(payload: LoginCreatorDto): Promise<CreatorResponse>;
    private toCreatorResponse;
    changePassword(payload: ChangePasswordDto): Promise<{
        message: string;
    }>;
    updateProfile(payload: UpdateProfileDto): Promise<{
        message: string;
    }>;
    private sendDiscordNotification;
    findCreatorByUserId(userId: string): Promise<{
        id: string;
        handle: string;
        displayName: string;
    } | null>;
    requestPasswordReset(payload: PasswordResetRequestDto): Promise<{
        message: string;
    }>;
    confirmPasswordReset(payload: PasswordResetConfirmDto): Promise<{
        message: string;
    }>;
}
export {};
