import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsBoolean, IsDate, IsUUID, IsEmail } from 'class-validator';

export class ReqUserDto {

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;


    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty()
    @IsArray()
    @IsNotEmpty()
    addresses: string | string[];


    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    isActive: boolean;

    createdAt?: Date;
}
