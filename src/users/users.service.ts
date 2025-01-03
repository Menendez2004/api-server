import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UseFilters } from '@nestjs/common';
import { PrismaService } from 'src/helpers/prisma/prisma.service';
import { Prisma, Users, UserRoles } from '@prisma/client';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) { }

    async createUser(data: Prisma.UsersCreateInput): Promise<Users> {
        try {
            const existingUser = await this.prismaService.users.findUnique({
                where: {
                    email: data.email,
                },
            })
            if (existingUser) {
                throw new BadRequestException('This Email is already in use');
            }
            return await this.prismaService.users.create({ data });
        } catch (err) {
            console.error('Error creating user:', err);
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    async hashPass(password: string): Promise<string> {
        const saltRounds = 10;
        try {
            return await bcrypt.hash(password, saltRounds);
        } catch (err) {
            throw new InternalServerErrorException(
                'An error occurred while hashing the password. Please try again later.',
            );
        }
    }

    async findById(id: string): Promise<Users | null> {
        try {
            const user = await this.prismaService.users.findUnique({
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


    async findByEmail(email: string): Promise<Users | null> {
        try {
            return await this.prismaService.users.findUnique({
                where: { email },
            });
        } catch (err) {
            throw new NotFoundException(`Error finding user by email ${email}: ${err.message}`);
        }
    }

    async getUserRole(userId: string): Promise<UserRoles | null> {
        try {
            const users = await this.findById(userId);
            return await this.prismaService.userRoles.findUnique({
                where: {
                    id: users.roleId
                },
            });
        } catch (error) {
            throw new NotFoundException(`Error fetching user role for user ID ${userId}: ${error.message}`);
        }
    }


}
