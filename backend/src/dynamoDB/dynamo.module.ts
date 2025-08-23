import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DynamoProvider } from './dynamo.provider';

@Module({
  imports: [ConfigModule],
  providers: [DynamoProvider],
  exports: [DynamoProvider],
})
export class DynamoModule {}
