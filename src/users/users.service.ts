import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from 'src/http.exception.filter';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
@UseFilters(new HttpExceptionFilter())
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.UserCreateInput): Promise<User> {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: {
                    email: data.email,
                },
            })
            if (existingUser) {
                throw new BadRequestException('This Email is already in use');
            }
            return await this.prisma.user.create({ data });
        } catch (err) {
            console.error('Error creating user:', err);
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    async hashPassword(password: string): Promise<string> {
        try {
            return await argon2.hash(password);
        } catch (error) {
            throw new InternalServerErrorException('Error hashing password');
        }
    }

    async findById(id: number): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });

            if (!user) {
                throw new NotFoundException(`imposible to finda a user with id: ${id}`);
            }
            return user;
        } catch (err) {
            throw new NotFoundException(`Error finding user by ID ${id}: ${err.message}`);
        }
    }

    async findByUUID(uuid: string): Promise<User | null> {
        try {
            return await this.prisma.user.findUnique({
                where: { uuid },
            });
        } catch (err) {
            throw new NotFoundException(`Error finding user by UUID ${uuid}: ${err.message}`);
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            return await this.prisma.user.findUnique({
                where: { email },
            });
        } catch (err) {
            throw new NotFoundException(`Error finding user by email ${email}: ${err.message}`);
        }
    }

    async getUserRole(userId: number): Promise<UserRole | null> {
        try {
            return await this.prisma.userRole.findFirst({
                where: {
                    id: userId,
                },
            });
        } catch (error) {
            throw new NotFoundException(`Error fetching user role for user ID ${userId}: ${error.message}`);
        }
    }


}
