import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PasswordService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllPasswords(userId: number) {
    return this.prisma.password.findMany({
      where: {
        userId: userId,
      },
    });
  }
}
