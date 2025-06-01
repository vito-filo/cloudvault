// Disable unbound-method eslint rule, as we are using Jest to mock the service methods
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordController } from './password.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PasswordService } from './password.service';
import {
  CreatePasswordDto,
  GetPasswordDto,
  GetPasswordDetailDto,
  UpdatePasswordDto,
} from './dto';
import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// This unit tests assert that the PasswordController:
// - is defined correctly
// - return the expected results when called with mock data.
// - call the service methods with the correct arguments
// - handle errors correctly

describe('PasswordController', () => {
  let controller: PasswordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, ConfigModule],
      controllers: [PasswordController],
      providers: [PasswordService],
    }).compile();

    controller = module.get<PasswordController>(PasswordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

describe('PasswordController', () => {
  let controller: PasswordController;
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PasswordController],
      providers: [
        {
          provide: PasswordService,
          useValue: {
            getAllPasswords: jest.fn(() => {}),
            getPasswordById: jest.fn(() => {}),
            createPassword: jest.fn(() => {}),
            updatePassword: jest.fn(() => {}),
            deletePassword: jest.fn(() => {}),
          },
        },
      ],
    }).compile();

    controller = module.get<PasswordController>(PasswordController);
    service = module.get<PasswordService>(PasswordService);
  });

  describe('findAll', () => {
    it('should return all passwords for a user', async () => {
      const mockPasswordsList: GetPasswordDto[] = [
        {
          id: 'abc123',
          serviceName: 'Test',
          url: 'http://test.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'def456',
          serviceName: 'Test2',
          url: 'http://test2.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      jest
        .spyOn(service, 'getAllPasswords')
        .mockResolvedValue(mockPasswordsList);

      const result = await controller.findAll('uuid123');
      expect(result).toEqual(mockPasswordsList);
      expect(service.getAllPasswords).toHaveBeenCalledWith('uuid123');
    });
  });

  describe('findOne', () => {
    it('should return a specific password', async () => {
      const mockPasswordDetail: GetPasswordDetailDto = {
        id: '1',
        password: 'password',
        serviceName: 'Test',
        url: null,
        username: 'alice',
        email: 'alice@test.com',
        description: 'Test password',
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest
        .spyOn(service, 'getPasswordById')
        .mockResolvedValue(mockPasswordDetail);

      const result = await controller.findOne('1', '1');
      expect(result).toEqual(mockPasswordDetail);
      expect(service.getPasswordById).toHaveBeenCalledWith('1', '1');
    });

    it('should throw NotFoundException if password is not found', async () => {
      jest
        .spyOn(service, 'getPasswordById')
        .mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('1', '1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new password', async () => {
      const mockCreatePasswordRes = {
        id: '1',
        serviceName: 'Test',
        url: 'http://test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const createDto: CreatePasswordDto = {
        serviceName: 'Test',
        url: 'http://test.com',
        password: 'password',
      };
      jest
        .spyOn(service, 'createPassword')
        .mockResolvedValue(mockCreatePasswordRes);

      const result = await controller.create('1', createDto);
      expect(result).toEqual(mockCreatePasswordRes);
      expect(service.createPassword).toHaveBeenCalledWith('1', createDto);
    });
  });

  describe('update', () => {
    it('should update an existing password', async () => {
      const mockPassword = {
        id: '1',
        serviceName: 'Updated',
        url: 'http://updated.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updateDto: UpdatePasswordDto = {
        serviceName: 'Updated',
        url: 'http://updated.com',
      };
      jest.spyOn(service, 'updatePassword').mockResolvedValue(mockPassword);

      const result = await controller.update('1', '1', updateDto);
      expect(result).toEqual(mockPassword);
      expect(service.updatePassword).toHaveBeenCalledWith('1', '1', updateDto);
    });
  });

  describe('delete', () => {
    it('should delete a password', async () => {
      const mockPassword = {
        id: '1',
        serviceName: 'Test',
        url: 'http://test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(service, 'deletePassword').mockResolvedValue(mockPassword);

      const result = await controller.delete('1', '1');
      expect(result).toEqual(mockPassword);
      expect(service.deletePassword).toHaveBeenCalledWith('1', '1');
    });
  });
});
