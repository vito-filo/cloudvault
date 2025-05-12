import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { PasswordCreateInputDto } from './dto/password-create-input.dto';
import { PasswordUpdateInputDto } from './dto/password-update-input.dto';
import { PasswordOutputDto } from './dto/pasword-output.dto';

@Injectable()
export class PasswordService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPasswords(userId: number): Promise<PasswordOutputDto[]> {
    const passwordList = await this.prisma.password.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        serviceName: true,
        url: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return plainToInstance(PasswordOutputDto, passwordList, {
      excludeExtraneousValues: true,
    });
  }

  async getPasswordById(userId: number, passwordId: number) {
    const password = await this.prisma.password.findFirst({
      where: {
        userId: userId,
        id: passwordId,
      },
    });

    if (!password) {
      throw new NotFoundException(`Item doesn't exist`);
    }

    return password;
  }

  async createPassword(
    userId: number,
    createPasswordDto: PasswordCreateInputDto,
  ): Promise<PasswordOutputDto> {
    const password = await this.prisma.password.create({
      data: {
        ...createPasswordDto,
        userId: userId,
      },
      select: {
        id: true,
        serviceName: true,
        url: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return plainToInstance(PasswordOutputDto, password, {
      excludeExtraneousValues: true,
    });
  }

  async updatePassword(
    userId: number,
    passwordId: number,
    updatePasswordDto: PasswordUpdateInputDto,
  ): Promise<PasswordOutputDto> {
    const password = await this.prisma.password.update({
      where: {
        id: passwordId,
        userId: userId,
      },
      data: updatePasswordDto,
      select: {
        id: true,
        serviceName: true,
        url: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return plainToInstance(PasswordOutputDto, password, {
      excludeExtraneousValues: true,
    });
  }

  async deletePassword(
    userId: number,
    passwordId: number,
  ): Promise<PasswordOutputDto> {
    const password = await this.prisma.password.delete({
      where: {
        id: passwordId,
        userId: userId,
      },
      select: {
        id: true,
        serviceName: true,
        url: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return plainToInstance(PasswordOutputDto, password, {
      excludeExtraneousValues: true,
    });
  }
}
