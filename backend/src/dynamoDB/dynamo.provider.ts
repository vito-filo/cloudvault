import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const DynamoProvider: Provider = {
  provide: 'DYNAMO_CLIENT',
  useFactory: (configService: ConfigService) => {
    const client = new DynamoDBClient({
      region: configService.get<string>('REGION') || undefined,
      endpoint: configService.get<string>('DYNAMO_ENDPOINT') || undefined,
    });
    const marshallOptions = {
      removeUndefinedValues: true, // Remove undefined velue before storing
    };
    return DynamoDBDocument.from(client, { marshallOptions });
  },
  inject: [ConfigService],
};
