import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@omniflow.io', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123456', description: 'User password' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
