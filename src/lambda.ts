import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import { Callback, Context, Handler } from 'aws-lambda';
import { LoggingMiddleware } from './middleware/logging.middleware';
import { AppModule } from './app.module';

let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Removes unexpected fields
      forbidNonWhitelisted: true, // Throw an error for unexpected fields]
      disableErrorMessages: true,
    }),
  );
  app.use(new LoggingMiddleware().use);
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    credentials: true,
  });

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};
