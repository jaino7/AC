import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyDomainDto {
  @IsString()
  @IsNotEmpty()
  domainId!: string;
}
