import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import {
  CreatePasswordDto,
  GetPasswordDto,
  GetPasswordDetailDto,
  UpdatePasswordDto,
} from './dto';

@Injectable()
export class PasswordService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPasswords(userId: number): Promise<GetPasswordDto[]> {
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
    return plainToInstance(GetPasswordDto, passwordList, {
      excludeExtraneousValues: true,
    });
  }

  async getPasswordById(
    userId: number,
    passwordId: number,
  ): Promise<GetPasswordDetailDto> {
    const password = await this.prisma.password.findFirst({
      where: {
        userId: userId,
        id: passwordId,
      },
    });

    if (!password) {
      throw new NotFoundException(`Item doesn't exist`);
    }

    return plainToInstance(GetPasswordDetailDto, password, {
      excludeExtraneousValues: true,
    });
  }

  async createPassword(
    userId: number,
    createPasswordDto: CreatePasswordDto,
  ): Promise<GetPasswordDto> {
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
    return plainToInstance(GetPasswordDto, password, {
      excludeExtraneousValues: true,
    });
  }

  async updatePassword(
    userId: number,
    passwordId: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<GetPasswordDto> {
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
    return plainToInstance(GetPasswordDto, password, {
      excludeExtraneousValues: true,
    });
  }

  async deletePassword(
    userId: number,
    passwordId: number,
  ): Promise<GetPasswordDto> {
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

    return plainToInstance(GetPasswordDto, password, {
      excludeExtraneousValues: true,
    });
  }
}
