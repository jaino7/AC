import { Body, Controller, Post, Put } from "@nestjs/common";
import { CreatorsService } from "./creators.service";
import { CreateCreatorDto } from "./dto/create-creator.dto";
import { LoginCreatorDto } from "./dto/login-creator.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";

@Controller("creators")
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) { }

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
}
