import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailProvider } from './email.provider';

@Module({
  providers: [EmailService, EmailProvider],
  exports: [EmailService],
})
export class EmailModule {}
