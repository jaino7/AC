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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorsController = void 0;
const common_1 = require("@nestjs/common");
const creators_service_1 = require("./creators.service");
const create_creator_dto_1 = require("./dto/create-creator.dto");
const login_creator_dto_1 = require("./dto/login-creator.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const update_profile_dto_1 = require("./dto/update-profile.dto");
const password_reset_request_dto_1 = require("./dto/password-reset-request.dto");
const password_reset_confirm_dto_1 = require("./dto/password-reset-confirm.dto");
const storage_service_1 = require("../storage/storage.service");
let CreatorsController = class CreatorsController {
    constructor(creatorsService, storageService) {
        this.creatorsService = creatorsService;
        this.storageService = storageService;
    }
    create(createCreatorDto) {
        return this.creatorsService.create(createCreatorDto);
    }
    login(loginCreatorDto) {
        return this.creatorsService.login(loginCreatorDto);
    }
    changePassword(changePasswordDto) {
        return this.creatorsService.changePassword(changePasswordDto);
    }
    updateProfile(updateProfileDto) {
        return this.creatorsService.updateProfile(updateProfileDto);
    }
    requestPasswordReset(dto) {
        return this.creatorsService.requestPasswordReset(dto);
    }
    confirmPasswordReset(dto) {
        return this.creatorsService.confirmPasswordReset(dto);
    }
    async getStorageUsage(userId) {
        const creator = await this.creatorsService.findCreatorByUserId(userId);
        if (!creator) {
            throw new Error("クリエイタープロフィールが見つかりません");
        }
        return this.storageService.getStorageUsage(creator.id);
    }
};
exports.CreatorsController = CreatorsController;
__decorate([
    (0, common_1.Post)("signup"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_creator_dto_1.CreateCreatorDto]),
    __metadata("design:returntype", void 0)
], CreatorsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)("login"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_creator_dto_1.LoginCreatorDto]),
    __metadata("design:returntype", void 0)
], CreatorsController.prototype, "login", null);
__decorate([
    (0, common_1.Put)("change-password"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], CreatorsController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Put)("update-profile"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", void 0)
], CreatorsController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)("password-reset/request"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_request_dto_1.PasswordResetRequestDto]),
    __metadata("design:returntype", void 0)
], CreatorsController.prototype, "requestPasswordReset", null);
__decorate([
    (0, common_1.Post)("password-reset/confirm"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [password_reset_confirm_dto_1.PasswordResetConfirmDto]),
    __metadata("design:returntype", void 0)
], CreatorsController.prototype, "confirmPasswordReset", null);
__decorate([
    (0, common_1.Get)("storage"),
    __param(0, (0, common_1.Headers)("x-user-id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getStorageUsage", null);
exports.CreatorsController = CreatorsController = __decorate([
    (0, common_1.Controller)("creators"),
    __metadata("design:paramtypes", [creators_service_1.CreatorsService,
        storage_service_1.StorageService])
], CreatorsController);
//# sourceMappingURL=creators.controller.js.map