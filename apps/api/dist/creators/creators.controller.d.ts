import { CreatorsService } from "./creators.service";
import { CreateCreatorDto } from "./dto/create-creator.dto";
import { LoginCreatorDto } from "./dto/login-creator.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { PasswordResetRequestDto } from "./dto/password-reset-request.dto";
import { PasswordResetConfirmDto } from "./dto/password-reset-confirm.dto";
import { StorageService } from "../storage/storage.service";
export declare class CreatorsController {
    private readonly creatorsService;
    private readonly storageService;
    constructor(creatorsService: CreatorsService, storageService: StorageService);
    create(createCreatorDto: CreateCreatorDto): Promise<{
        id: string;
        email: string;
        verified: boolean;
        handle?: string;
        createdAt?: Date;
    }>;
    login(loginCreatorDto: LoginCreatorDto): Promise<{
        id: string;
        email: string;
        verified: boolean;
        handle?: string;
        createdAt?: Date;
    }>;
    changePassword(changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    updateProfile(updateProfileDto: UpdateProfileDto): Promise<{
        message: string;
    }>;
    requestPasswordReset(dto: PasswordResetRequestDto): Promise<{
        message: string;
    }>;
    confirmPasswordReset(dto: PasswordResetConfirmDto): Promise<{
        message: string;
    }>;
    getStorageUsage(userId: string): Promise<{
        usedBytes: string;
        limitBytes: string;
        availableBytes: string;
        usagePercent: number;
        usedFormatted: string;
        limitFormatted: string;
        availableFormatted: string;
    }>;
}
