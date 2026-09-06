import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secret@123', description: 'Password (min 6 chars)' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '+8801700000000', required: false })
  @IsOptional()
  phone?: string;
}
