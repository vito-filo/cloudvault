import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamoProvider } from './dynamo.provider';
// import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

describe('DynamoProvider', () => {
  let testingModule: TestingModule;
  let dynamoClient: DynamoDBDocument;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'REGION') return 'eu-central-1';
      if (key === 'DYNAMO_ENDPOINT') return 'http://localhost:55000';
    }),
  };
  beforeEach(async () => {
    testingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [ConfigService, DynamoProvider],
      exports: [DynamoProvider],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .compile();

    const dynamoProvider =
      testingModule.get<typeof DynamoProvider>('DYNAMO_CLIENT');
    expect(dynamoProvider).toBeDefined();
    dynamoClient = testingModule.get<DynamoDBDocument>('DYNAMO_CLIENT');
  });
  it('should create a DocumentClient with the correct configuration', async () => {
    expect(dynamoClient).toBeDefined(); // Ensure the provider is properly instantiated
    expect(dynamoClient).toHaveProperty('config');
    expect(await dynamoClient.config.region()).toBe('eu-central-1');
  });

  it('should contain Registration table', async () => {
    await dynamoClient.put({
      TableName: 'registration',
      Item: {
        email: 'example@email.com',
        options: { Challenge: '123' },
        ttl: Math.floor(Date.now() / 1000) + 60,
      },
    });

    const challengeOptions = await dynamoClient.get({
      TableName: 'registration',
      Key: { email: 'example@email.com' },
      AttributesToGet: ['options'],
    });
    expect(challengeOptions).toBeDefined();
  });
});
