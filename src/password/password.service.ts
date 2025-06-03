import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import {
  CreatePasswordDto,
  GetPasswordDto,
  GetPasswordDetailDto,
  UpdatePasswordDto,
  GetPasswordsQueryDto,
} from './dto';
import { generateIV, encrypt, decrypt } from '../common/utils/crypto.util';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

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

  async getAllPasswords({
    userId,
    groupId,
  }: GetPasswordsQueryDto): Promise<GetPasswordDto[]> {
    let whereCondition: Prisma.PasswordWhereInput = {};
    if (userId && !groupId) {
      whereCondition = {
        ownerId: userId,
        groupShares: { none: {} }, // Exclude shared passwords
      };
    } else if (groupId && userId) {
      const isInGroup = await this.prisma.isInGroup(userId, groupId);
      if (!isInGroup) {
        throw new UnauthorizedException();
      }
      whereCondition = {
        groupShares: {
          some: {
            groupId: groupId,
          },
        },
      };
    }

    try {
      const passwordList = await this.prisma.password.findMany({
        where: whereCondition,
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
    } catch (error) {
      console.error('Error retrieving passwords:', error);
      throw new InternalServerErrorException('Failed to retrieve passwords');
    }
  }

  async getPasswordById(
    userId: string,
    passwordId: string,
  ): Promise<GetPasswordDetailDto> {
    try {
      const password = await this.prisma.password.findFirst({
        where: {
          ownerId: userId,
          id: passwordId,
        },
      }); // TODO currently throws 500 when not found, should throw 404

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
    userId: string,
    createPasswordDto: CreatePasswordDto,
  ): Promise<GetPasswordDto> {
    try {
      const iv = generateIV();
      const encryptedPassword = encrypt(
        createPasswordDto.password,
        this.KEY,
        iv,
      );

      const { groupIds, ...passwordData } = createPasswordDto;

      const response = await this.prisma.password.create({
        data: {
          ...passwordData,
          ownerId: userId,
          iv: iv.toString('hex'),
          password: encryptedPassword,
          groupShares: {
            create: groupIds?.map((groupId) => ({
              group: { connect: { id: groupId } }, // Corrected syntax
            })),
          },
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
    userId: string,
    passwordId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<GetPasswordDto> {
    const isOwner = await this.prisma.isPasswordOwner(userId, passwordId);
    if (!isOwner) {
      throw new UnauthorizedException(`You are not the owner of this password`);
    }

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
          ownerId: userId,
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
    userId: string,
    passwordId: string,
  ): Promise<GetPasswordDto> {
    // Check if the password exists and belongs to the user
    const isOwner = await this.prisma.isPasswordOwner(userId, passwordId);
    if (!isOwner) {
      throw new UnauthorizedException(`You are not the owner of this password`);
    }

    const password = await this.prisma.password.delete({
      where: {
        id: passwordId,
        ownerId: userId,
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
