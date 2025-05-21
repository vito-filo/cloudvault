import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { SignupDto, LoginDto, ConfirmSignupDto } from './dto';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';

// This unit tests assert that the AuthController:
// - Validate correct input DTOs
// - Valitation fails with appropriate message when called with wrong input DTOs

interface ValidationErrorResponse {
  error: string;
  message: string | string[];
  statusCode: number;
}

const validDto = {
  email: 'user@example.com',
  password: 'Password123!',
};

const cases = [
  {
    name: 'invalid email format',
    input: { ...validDto, email: 'not-an-email' },
    message: 'email must be an email',
  },
  {
    name: 'password too short',
    input: { ...validDto, password: 'P123e!' },
    message: 'Password must contain at least 8 characters',
  },
  {
    name: 'password missing number',
    input: { ...validDto, password: 'Password!' },
    message: 'Password must contain at least one number',
  },
  {
    name: 'password missing special character',
    input: { ...validDto, password: 'Password1' },
    message: 'Password must contain at least one special character',
  },
  {
    name: 'password missing uppercase letter',
    input: { ...validDto, password: 'password1!' },
    message: 'Password must contain at least one uppercase letter',
  },
  {
    name: 'password missing lowercase letter',
    input: { ...validDto, password: 'PASSWORD1!' },
    message: 'Password must contain at least one lowercase letter',
  },
];

describe('Auth', () => {
  let app: INestApplication;
  const authService = {
    signUpWithCognito: jest.fn(),
    authenticateWithCognito: jest.fn(),
    confirmSignUp: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  describe('POST /auth/signup', () => {
    it('should sign up a valid SignupDto', () => {
      const signupDto: SignupDto = validDto;
      return request(app.getHttpServer()) // TODO fix this warning
        .post('/auth/signup')
        .send(signupDto)
        .expect(201);
    });

    it.each(cases)(
      'signUp should fail when $name',
      async ({ input, message }) => {
        const signupDto = Object.assign(new LoginDto(), input);
        return request(app.getHttpServer()) // TODO fix this warning
          .post('/auth/signup')
          .send(signupDto)
          .expect(400)
          .then((response: request.Response) => {
            const body = response.body as ValidationErrorResponse;
            expect(body.statusCode).toBe(400);
            expect(body.error).toEqual('Bad Request');
            expect(body.message).toContain(message);
          });
      },
    );
  });

  describe('POST /auth/login', () => {
    it('should login a valid loginDto', () => {
      const loginDto = Object.assign(new LoginDto(), validDto);
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201);
    });

    it.each(cases)(
      'login should fail when $name',
      async ({ input, message }) => {
        const loginDto = Object.assign(new LoginDto(), input);
        return request(app.getHttpServer())
          .post('/auth/login')
          .send(loginDto)
          .expect(400)
          .then((response: request.Response) => {
            const body = response.body as ValidationErrorResponse;
            expect(body.statusCode).toBe(400);
            expect(body.error).toEqual('Bad Request');
            expect(body.message).toContain(message);
          });
      },
    );
  });

  describe('POST /auth/confirm-email', () => {
    const validConfirmDto = {
      email: 'alice@gmail.com',
      userSub: 'user-sub',
      code: '123456',
    };

    const confirmSignupCases = [
      {
        name: 'invalid email format',
        input: { ...validConfirmDto, email: 'not-an-email' },
        message: 'email must be an email',
      },
      {
        name: 'missing userSub',
        input: { ...validConfirmDto, userSub: '' },
        message: 'userSub should not be empty',
      },
      {
        name: 'missing code',
        input: { ...validConfirmDto, code: '' },
        message: 'code should not be empty',
      },
      {
        name: 'code too short',
        input: { ...validConfirmDto, code: '123' },
        message: 'Code must contain at least 6 characters',
      },
    ];

    it('should confirm a valid input', () => {
      const consfirmSignupDto = Object.assign(
        new ConfirmSignupDto(),
        validConfirmDto,
      );

      return request(app.getHttpServer())
        .post('/auth/confirm-email')
        .send(consfirmSignupDto)
        .expect(201);
    });

    it.each(confirmSignupCases)(
      'login should fail when $name',
      async ({ input, message }) => {
        const confirmSignupDto = Object.assign(new ConfirmSignupDto(), input);
        return request(app.getHttpServer())
          .post('/auth/confirm-email')
          .send(confirmSignupDto)
          .expect(400)
          .then((response: request.Response) => {
            const body = response.body as ValidationErrorResponse;
            expect(body.statusCode).toBe(400);
            expect(body.error).toEqual('Bad Request');
            expect(body.message).toContain(message);
          });
      },
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
