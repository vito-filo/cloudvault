import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { PasswordService } from './password.service';
import { PasswordDetailOutputDto } from './dto/password-detail-output.dto';
import { PasswordCreateInputDto } from './dto/password-create-input.dto';
import { PasswordUpdateInputDto } from './dto/password-update-input.dto';
import { PasswordOutputDto } from './dto/pasword-output.dto';
@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  // Get all passwords for a specific user
  @Get(':id')
  findAll(@Param('id') id: string): Promise<PasswordOutputDto[]> {
    return this.passwordService.getAllPasswords(+id);
  }

  // Get details of a specific user's password
  @Get(':id/:passwordId')
  findOne(
    @Param('id') id: string,
    @Param('passwordId') passwordId: string,
  ): Promise<PasswordDetailOutputDto | null> {
    return this.passwordService.getPasswordById(+id, +passwordId);
  }

  // Create a new password
  @Post(':id')
  create(
    @Param('id', ParseIntPipe) id: number,
    @Body() createPasswordDto: PasswordCreateInputDto,
  ): Promise<PasswordOutputDto> {
    return this.passwordService.createPassword(id, createPasswordDto);
  }

  // Update an existing password
  @Patch(':id/:passwordId')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Param('passwordId', ParseIntPipe) passwordId: number,
    @Body() updatePasswordDto: PasswordUpdateInputDto,
  ): Promise<PasswordOutputDto> {
    return this.passwordService.updatePassword(
      id,
      passwordId,
      updatePasswordDto,
    );
  }

  // Delete a password
  @Delete(':id/:passwordId')
  delete(
    @Param('id', ParseIntPipe) id: number,
    @Param('passwordId', ParseIntPipe) passwordId: number,
  ): Promise<PasswordOutputDto> {
    return this.passwordService.deletePassword(id, passwordId);
  }
}
