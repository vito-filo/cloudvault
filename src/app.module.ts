import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PasswordModule } from './password/password.module';
import { PrismaModule } from './prisma/prisma.module';
import { GroupModule } from './group/group.module';
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
        USER_POOL_ID: Joi.string().required(),
        REGION: Joi.string().required(),
        AES_KEY: Joi.string()
          .required()
          .pattern(/^[a-zA-Z0-9_+]+$/)
          .messages({
            'string.pattern.base':
              '"AES_KEY" fails to match the required pattern: /^[a-zA-Z0-9_+]+$/',
          }),
        JWT_SECRET: Joi.string().required(),
        ALLOWED_ORIGINS: Joi.string().required(),
      }),
    }),
    AuthModule,
    PasswordModule,
    PrismaModule,
    GroupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
