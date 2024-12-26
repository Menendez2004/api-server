import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserResponse } from './dto/resposes/user-response';

@Controller('users')
export class UsersController {
    constructor(private userService: UsersService) {}

    // POST

    // GET

    // GET (id)

    // PUT

    // DELETE




}
