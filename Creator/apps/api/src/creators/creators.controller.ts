import { Body, Controller, Get, Headers, Post, Put } from "@nestjs/common";
import { CreatorsService } from "./creators.service";
import { CreateCreatorDto } from "./dto/create-creator.dto";
import { LoginCreatorDto } from "./dto/login-creator.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { PasswordResetRequestDto } from "./dto/password-reset-request.dto";
import { PasswordResetConfirmDto } from "./dto/password-reset-confirm.dto";
import { StorageService } from "../storage/storage.service";

@Controller("creators")
export class CreatorsController {
  constructor(
    private readonly creatorsService: CreatorsService,
    private readonly storageService: StorageService,
  ) { }

  @Post("signup")
  create(@Body() createCreatorDto: CreateCreatorDto) {
    return this.creatorsService.create(createCreatorDto);
  }

  @Post("login")
  login(@Body() loginCreatorDto: LoginCreatorDto) {
    return this.creatorsService.login(loginCreatorDto);
  }

  @Put("change-password")
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.creatorsService.changePassword(changePasswordDto);
  }

  @Put("update-profile")
  updateProfile(@Body() updateProfileDto: UpdateProfileDto) {
    return this.creatorsService.updateProfile(updateProfileDto);
  }

  @Post("password-reset/request")
  requestPasswordReset(@Body() dto: PasswordResetRequestDto) {
    return this.creatorsService.requestPasswordReset(dto);
  }

  @Post("password-reset/confirm")
  confirmPasswordReset(@Body() dto: PasswordResetConfirmDto) {
    return this.creatorsService.confirmPasswordReset(dto);
  }

  @Get("storage")
  async getStorageUsage(@Headers("x-user-id") userId: string) {
    // ユーザーIDからクリエイターIDを取得
    const creator = await this.creatorsService.findCreatorByUserId(userId);
    if (!creator) {
      throw new Error("クリエイタープロフィールが見つかりません");
    }
    return this.storageService.getStorageUsage(creator.id);
  }
}
