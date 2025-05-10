import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';

describe('Auth', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  it(`/POST login refuse wrong input`, () => {
    const loginDto: LoginDto = { email: 'test', password: 'test' };
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(400)
      .then((response) => {
        console.log(response.body);
      });
  });

  it(`/POST signup refuse wrong email formats`, () => {
    const signupDto: SignupDto = {
      email: 'test',
      password: 'ValidPasswordFormat123!',
    };
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send(signupDto)
      .expect(400)
      .then((response) => {
        const responseBody = response.body as { message: string[] };
        expect(responseBody.message).toEqual(['email must be an email']);
      });
  });

  it(`/POST signup refuse invalid password`, async () => {
    const testCases: { signupDto: SignupDto; expectedMessages: string[] }[] = [
      {
        signupDto: { email: 'valid.email@gmail.com', password: 'short' },
        expectedMessages: [
          'Password must contain at least 8 characters',
          'Password must contain at least one number',
        ],
      },
      {
        signupDto: { email: 'valid.email@gmail.com', password: 'alllowercase' },
        expectedMessages: ['Password must contain at least one number'],
      },
      {
        signupDto: { email: 'valid.email@gmail.com', password: '12345678' },
        expectedMessages: [
          'Password must contain at least one special character',
        ],
      },
      {
        signupDto: { email: 'valid.email@gmail.com', password: 'NoNumber!' },
        expectedMessages: ['Password must contain at least one number'],
      },
    ];

    for (const { signupDto, expectedMessages } of testCases) {
      try {
        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send(signupDto)
          .expect(400);

        const responseBody = response.body as { message: string[] };
        expect(responseBody.message.sort()).toEqual(expectedMessages.sort());
      } catch (error) {
        console.error(
          `Test failed for signupDto: ${JSON.stringify(signupDto)}`,
        );
        throw error; // Re-throw the error to ensure the test still fails
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });
});
