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
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
      validationSchema: Joi.object({
        REGION: Joi.string().required(),
        AES_KEY: Joi.string()
          .required()
          .pattern(/^[a-zA-Z0-9_+]+$/)
          .messages({
            'string.pattern.base':
              '"AES_KEY" fails to match the required pattern: /^[a-zA-Z0-9_+]+$/',
          }),
        JWT_SECRET: Joi.string().required(),
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
