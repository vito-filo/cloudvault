import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        CLIENT_ID: Joi.string()
          .required()
          .pattern(/^[a-zA-Z0-9_+]+$/)
          .messages({
            'string.pattern.base':
              '"CLIENT_ID" fails to match the required pattern: /^[a-zA-Z0-9_+]+$/',
          }),
        CLIENT_SECRET: Joi.string()
          .required()
          .pattern(/^[a-zA-Z0-9_+]+$/)
          .messages({
            'string.pattern.base':
              '"CLIENT_SECRET" fails to match the required pattern: /^[a-zA-Z0-9_+]+$/',
          }),
      }),
    }),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
