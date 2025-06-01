import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { PasswordService } from './password.service';
import {
  CreatePasswordDto,
  GetPasswordDto,
  GetPasswordDetailDto,
  UpdatePasswordDto,
} from './dto';
@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  // Get all passwords for a specific user
  @Get(':id')
  findAll(@Param('id') id: string): Promise<GetPasswordDto[]> {
    return this.passwordService.getAllPasswords(id);
  }

  // Get details of a specific user's password
  @Get(':id/:passwordId')
  findOne(
    @Param('id') id: string,
    @Param('passwordId') passwordId: string,
  ): Promise<GetPasswordDetailDto | null> {
    return this.passwordService.getPasswordById(id, passwordId);
  }

  // Create a new password
  @Post(':id')
  create(
    @Param('id') id: string,
    @Body() createPasswordDto: CreatePasswordDto,
  ): Promise<GetPasswordDto> {
    return this.passwordService.createPassword(id, createPasswordDto);
  }

  // Update an existing password
  @Patch(':id/:passwordId')
  update(
    @Param('id') id: string,
    @Param('passwordId') passwordId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<GetPasswordDto> {
    return this.passwordService.updatePassword(
      id,
      passwordId,
      updatePasswordDto,
    );
  }

  // Delete a password
  @Delete(':id/:passwordId')
  delete(
    @Param('id') id: string,
    @Param('passwordId') passwordId: string,
  ): Promise<GetPasswordDto> {
    return this.passwordService.deletePassword(id, passwordId);
  }
}
