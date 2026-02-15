import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateDomainDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, {
    message: '有効なドメイン名を入力してください',
  })
  domain!: string;
}
