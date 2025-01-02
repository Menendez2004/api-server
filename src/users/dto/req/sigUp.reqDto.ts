import { Expose } from "class-transformer";
import { IsDefined, IsNotEmpty, IsString } from "class-validator";

export class SignUpReqDto {
    
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    @Expose({ name: 'firstName' })
    firstName: string;

    @IsDefined()
    @IsString()
    @IsNotEmpty()
    @Expose({ name: 'lastName' })
    lastName: string;

    @IsDefined()
    @IsString()
    @IsNotEmpty()
    @Expose({ name: 'userName' })
    userName: string;

    @IsDefined()
    @IsString()
    @IsNotEmpty()
    email: string;


    @IsDefined()
    @IsString()
    @IsNotEmpty()
    address: string;


    @IsDefined()
    @IsString()
    @IsNotEmpty()
    password: string;
    



}