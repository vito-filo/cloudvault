import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import {
  CreatePasswordDto,
  GetPasswordDto,
  GetPasswordDetailDto,
  UpdatePasswordDto,
} from './dto';
import { generateIV, encrypt, decrypt } from 'src/common/utils/crypto.util';
import { ConfigService } from '@nestjs/config';

// TODO manage errors: eg not found when updating/deleting a password with wrong id
@Injectable()
export class PasswordService {
  private readonly KEY: Buffer;
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    // TODO get the key from AWS MKS
    const key = this.configService.get<string>('AES_KEY', 'undefined');
    this.KEY = Buffer.from(key, 'hex');
  }

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
    try {
      const password = await this.prisma.password.findFirst({
        where: {
          userId: userId,
          id: passwordId,
        },
      });

      if (!password) {
        throw new NotFoundException(`Item doesn't exist`);
      }

      // Decrypt the password
      const decryptedPassword = decrypt(
        password.password,
        this.KEY,
        Buffer.from(password.iv, 'hex'),
      );
      password.password = decryptedPassword;

      return plainToInstance(GetPasswordDetailDto, password, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error retrieving password:', error);
      throw new InternalServerErrorException('Failed to retrieve password');
    }
  }

  async createPassword(
    userId: number,
    createPasswordDto: CreatePasswordDto,
  ): Promise<GetPasswordDto> {
    try {
      const iv = generateIV();
      const encryptedPassword = encrypt(
        createPasswordDto.password,
        this.KEY,
        iv,
      );
      const response = await this.prisma.password.create({
        data: {
          ...createPasswordDto,
          userId: userId,
          iv: iv.toString('hex'),
          password: encryptedPassword,
        },
        select: {
          id: true,
          serviceName: true,
          url: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return plainToInstance(GetPasswordDto, response, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Error creating password:', error);
      throw new InternalServerErrorException('Failed to create password');
    }
  }

  async updatePassword(
    userId: number,
    passwordId: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<GetPasswordDto> {
    try {
      let updateData: UpdatePasswordDto & { iv?: string };

      if (updatePasswordDto.password) {
        // Encrypt and update the password
        const iv = generateIV();
        const encryptedPassword = encrypt(
          updatePasswordDto.password,
          this.KEY,
          iv,
        );
        updatePasswordDto.password = encryptedPassword;
        updateData = { ...updatePasswordDto, iv: iv.toString('hex') };
      } else {
        updateData = { ...updatePasswordDto };
      }

      const password = await this.prisma.password.update({
        where: {
          id: passwordId,
          userId: userId,
        },
        data: updateData,
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
    } catch (error) {
      console.error('Error updating password:', error);
      throw new InternalServerErrorException('Failed to update password');
    }
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
