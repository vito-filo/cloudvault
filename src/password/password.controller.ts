import { Controller, Get, Param } from '@nestjs/common';
import { PasswordService } from './password.service';

@Controller('password')
export class PasswordController {
  constructor(private readonly passwordService: PasswordService) {}

  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.passwordService.getAllPasswords(+id);
  }
}
