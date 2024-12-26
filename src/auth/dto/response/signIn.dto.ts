import { IsString, IsEmail } from 'class-validator';

/**
 * DTO for login requests.
 */
export class LoginRequestDto {
    @IsEmail()
    readonly email: string;

    @IsString()
    readonly password: string;
}

/**
 * DTO for login responses.
 */
export class LoginResponseDto {
    accessToken: string;
}
