import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { SignupDto, LoginDto, ConfirmSignupDto } from './dto';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import { AuthService } from './auth.service';
import { Server } from 'http';
import {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  AttestationFormat,
  VerifiedRegistrationResponse,
} from '@simplewebauthn/server';
import * as webauthn from '@simplewebauthn/server';

// This unit tests assert that the AuthController:
// - Validate correct input DTOs
// - Valitation fails with appropriate message when called with wrong input DTOs
// - Generates valid WebAuthn registration options
// - Verifies WebAuthn registration responses correctly
// - Generate cvalid WebAuthn authentication options
// - Verifies WebAuthn authentication responses correctly

// This tells Jest to mock the module BUT retain the real implementation
jest.mock('@simplewebauthn/server', () => {
  // Get the actual module (for all unmocked exports)
  const actual: typeof webauthn = jest.requireActual('@simplewebauthn/server');
  return {
    ...actual,
    verifyRegistrationResponse: jest.fn(),
    verifyAuthenticationResponse: jest.fn(),
  };
});

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
  let httpServer: import('http').Server;

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
    httpServer = app.getHttpServer() as unknown as Server;
    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  describe('POST /auth/signup', () => {
    it('should sign up a valid SignupDto', () => {
      const signupDto: SignupDto = validDto;
      return request(httpServer) // TODO fix this warning
        .post('/auth/signup')
        .send(signupDto)
        .expect(201);
    });

    it.each(cases)(
      'signUp should fail when $name',
      async ({ input, message }) => {
        const signupDto = Object.assign(new LoginDto(), input);
        return request(httpServer) // TODO fix this warning
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
      return request(httpServer).post('/auth/login').send(loginDto).expect(201);
    });

    it.each(cases)(
      'login should fail when $name',
      async ({ input, message }) => {
        const loginDto = Object.assign(new LoginDto(), input);
        return request(httpServer)
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

      return request(httpServer)
        .post('/auth/confirm-email')
        .send(consfirmSignupDto)
        .expect(201);
    });

    it.each(confirmSignupCases)(
      'login should fail when $name',
      async ({ input, message }) => {
        const confirmSignupDto = Object.assign(new ConfirmSignupDto(), input);
        return request(httpServer)
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

describe('Webauthn', () => {
  let app: INestApplication;
  let httpServer: import('http').Server;
  let authService: AuthService;
  let cacheManager: Cache;

  const CHALLENGE = 'bBUO4KrQm0JWURfcSsqj_saQgUNqFeFtj9soQNyPfgA';
  const ORIGIN = process.env.RP_ORIGIN || 'http://localhost:8000';
  const RP_NAME = process.env.RP_NAME || 'Cloud-Vault';
  const RP_ID = process.env.RP_ID || 'localhost';
  const EMAIL = 'example@email.com';

  const options: PublicKeyCredentialCreationOptionsJSON = {
    challenge: CHALLENGE,
    rp: {
      name: RP_NAME,
      id: ORIGIN,
    },
    user: {
      id: 'CXuw0KOpaH6JhkwQ_aEo25ZnffvJk9ZwvrypOgts80k',
      name: 'exampleUser',
      displayName: '',
    },
    pubKeyCredParams: [
      {
        alg: -8,
        type: 'public-key',
      },
      {
        alg: -7,
        type: 'public-key',
      },
      {
        alg: -257,
        type: 'public-key',
      },
    ],
    timeout: 60000,
    attestation: 'none',
    excludeCredentials: [],
    authenticatorSelection: {
      residentKey: 'discouraged',
      userVerification: 'preferred',
      requireResidentKey: false,
    },
    extensions: {
      credProps: true,
    },
    hints: [],
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    httpServer = app.getHttpServer() as unknown as Server;
    app.useGlobalPipes(new ValidationPipe());

    cacheManager = app.get<Cache>(CACHE_MANAGER);
    authService = moduleRef.get<AuthService>(AuthService);

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /webauthn/generate-registration-options', () => {
    it('should generate valid registration options', async () => {
      const options = await request(httpServer).get(
        `/auth/webauthn/generate-registration-options?email=${EMAIL}&userName=exampleUser`,
      );

      expect(options).toBeDefined();
      expect(options.status).toBe(200);

      const optionsJSON =
        options.body as PublicKeyCredentialCreationOptionsJSON;

      expect(optionsJSON).toHaveProperty('challenge');
      expect(optionsJSON).toHaveProperty('user');
      expect(optionsJSON).toHaveProperty('pubKeyCredParams');
      expect(optionsJSON).toHaveProperty('rp');
      expect(optionsJSON.rp).toHaveProperty('id');
      expect(optionsJSON.rp).toHaveProperty('name');
      expect(optionsJSON.rp.name).toBe(RP_NAME);
    });
  });

  describe('POST /webauthn/verify-registration-response', () => {
    it('should verify a valid registration response', async () => {
      // Mock the registration request from the client
      // This happens in client side, on navigator.credentials.create
      const mockedCreationResponse: RegistrationResponseJSON = {
        id: '1UJd7QWcBYXxvc7pnvGNY05L8rARZWhM7Z6achZ8f4w',
        rawId: '1UJd7QWcBYXxvc7pnvGNY05L8rARZWhM7Z6achZ8f4w',
        response: {
          clientDataJSON: Buffer.from(
            JSON.stringify({
              type: 'webauthn.create',
              challenge: CHALLENGE,
              origin: ORIGIN,
              crossOrigin: false,
            }),
          ).toString('base64'),
          attestationObject:
            'o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViBSZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NBAAAAAQECAwQFBgcIAQIDBAUGBwgAINVCXe0FnAWF8b3O6Z7xjWNOS_KwEWVoTO2emnIWfH-MpAEBAycgBiFYIO6x-F5TynpTDxBjAD0Aq_f2--K4zb5LpU2xBw3HhDVU',

          transports: ['internal'],
          publicKeyAlgorithm: -7,
          publicKey:
            'MCowBQYDK2VwAyEA7rH4XlPKelMPEGMAPQCr9_b74rjNvkulTbEHDceENVQ',
          authenticatorData:
            'SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2NBAAAAAQECAwQFBgcIAQIDBAUGBwgAINVCXe0FnAWF8b3O6Z7xjWNOS_KwEWVoTO2emnIWfH-MpAEBAycgBiFYIO6x-F5TynpTDxBjAD0Aq_f2--K4zb5LpU2xBw3HhDVU',
        },
        type: 'public-key',
        clientExtensionResults: {
          credProps: {
            rk: false,
          },
        },
        authenticatorAttachment: 'platform',
      };

      // Mock the response from verifyRegistrationResponse
      // This method relies on client (authenticator) encryption, therefore is hard to simulate
      const mockVerifyRegistrationResponse: VerifiedRegistrationResponse = {
        verified: true,
        registrationInfo: {
          fmt: 'none' as AttestationFormat,
          aaguid: '00000000-0000-0000-0000-000000000000',
          credentialType: 'public-key',
          credential: {
            id: 'cx1PZwjN7N-xsUUIY9j1-JRQhfhe2-Hw_1s-OEfKPrE',
            publicKey: new Uint8Array([164, 1, 1, 3, 39]),
            counter: 1,
            transports: ['usb'],
          },
          attestationObject: new Uint8Array([163, 99, 102, 109]),
          userVerified: true,
          credentialDeviceType: 'singleDevice',
          credentialBackedUp: false,
          origin: ORIGIN,
          rpID: RP_ID,
        },
      };

      // Create input for verifyRegistration ednpoint
      const verifiRegistrationDto = {
        email: EMAIL,
        response: mockedCreationResponse,
      };

      (webauthn.verifyRegistrationResponse as jest.Mock).mockResolvedValue(
        mockVerifyRegistrationResponse,
      );

      // Simulate the setting of options in the cache
      await cacheManager.set(verifiRegistrationDto.email, options, 300000);

      const mockPrismaCreate = jest
        .spyOn(authService['prisma'].passkey, 'create')
        .mockResolvedValue({
          userId: 'mockUserID',
          id: 'mockCredentialID',
          publicKey: Buffer.from('mockPublicKey'),
          webauthnUserID: 'mockUserID',
          counter: 0,
          transport: 'usb',
          deviceType: 'singleDevice',
          backedUp: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const response = await request(httpServer)
        .post('/auth/webauthn/verify-registration-response')
        .send(verifiRegistrationDto);

      expect(response).toBeDefined();
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('verified', true);
      expect(webauthn.verifyRegistrationResponse).toHaveBeenCalledWith({
        response: mockedCreationResponse,
        expectedChallenge: options.challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
      });
      expect(mockPrismaCreate).toHaveBeenCalled();
    });
  });

  describe('GET /webauthn/generate-authentication-options', () => {
    it('should generate valid authentication options', async () => {
      jest.spyOn(authService['prisma'].passkey, 'findMany').mockResolvedValue([
        {
          userId: 'mockUserID',
          id: 'mockCredentialID',
          publicKey: Buffer.from('mockPublicKey'),
          webauthnUserID: 'mockUserID',
          counter: 0,
          transport: 'usb',
          deviceType: 'singleDevice',
          backedUp: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const authOptions = await request(httpServer)
        .get('/auth/webauthn/generate-authentication-options')
        .query({ email: EMAIL });

      expect(authOptions).toBeDefined();
      expect(authOptions.status).toBe(200);
      expect(authOptions.body).toHaveProperty('challenge');
      expect(authOptions.body).toHaveProperty('rpId', RP_ID);
      expect(authOptions.body).toHaveProperty(
        'allowCredentials',
        expect.any(Array),
      );
    });
  });

  describe('POST /webauthn/verify-authentication-response', () => {
    it('should verify a valid authentication response', async () => {
      const authenticationResponse = {
        id: 'G7r3QpKof8RWTZGUGTPbZhnCKGXrCtNlFOJnaO8CZRc',
        rawId: 'G7r3QpKof8RWTZGUGTPbZhnCKGXrCtNlFOJnaO8CZRc',
        response: {
          authenticatorData:
            'SZYN5YgOjGh0NBcPZHZgW4_krrmihjLHmVzzuoMdl2MFAAAAAw',
          clientDataJSON:
            'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoidGZUZHhqa3VIYnBTZ3BndXRsRlpfSnpoUjhwR0JhT3hqd1daclNUeHVGUSIsIm9yaWdpbiI6Imh0dHA6Ly9sb2NhbGhvc3Q6ODAwMCIsImNyb3NzT3JpZ2luIjpmYWxzZSwib3RoZXJfa2V5c19jYW5fYmVfYWRkZWRfaGVyZSI6ImRvIG5vdCBjb21wYXJlIGNsaWVudERhdGFKU09OIGFnYWluc3QgYSB0ZW1wbGF0ZS4gU2VlIGh0dHBzOi8vZ29vLmdsL3lhYlBleCJ9',
          signature:
            'PDtEUy-WvTQI0me2VXKruhBfIdikzeoDOgsgvMPnuyHMgy7ILGrcyy9FbnnVQdYZKs-oC4JUu1Ud40p4dDaIDw',
        },
        type: 'public-key',
        clientExtensionResults: {},
        authenticatorAttachment: 'cross-platform',
      };

      const mockVerifyRegistrationResponse = {
        verified: true,
        authenticationInfo: {
          newCounter: 3,
          credentialID: 'G7r3QpKof8RWTZGUGTPbZhnCKGXrCtNlFOJnaO8CZRc',
          userVerified: true,
          credentialDeviceType: 'singleDevice',
          credentialBackedUp: false,
          origin: ORIGIN,
          rpID: RP_ID,
        },
      };

      // Create input for verifyRegistration ednpoint
      const verifyAuthenticationDto = {
        email: EMAIL,
        response: authenticationResponse,
      };

      const mockedAuthOptions = {
        rpId: RP_ID,
        challenge: 'tfTdxjkuHbpSgpgutlFZ_JzhR8pGBaOxjwWZrSTxuFQ',
        allowCredentials: [
          {
            id: 'AGePhZV9jNu968R4aglza-ubWiIF1fyVxsetqQoX62o',
            transports: ['usb'],
            type: 'public-key',
          },
          {
            id: 'G7r3QpKof8RWTZGUGTPbZhnCKGXrCtNlFOJnaO8CZRc',
            transports: ['usb'],
            type: 'public-key',
          },
        ],
        timeout: 60000,
        userVerification: 'preferred',
      };

      jest.spyOn(authService['prisma'].passkey, 'findFirst').mockResolvedValue({
        userId: 'mockUserID',
        id: 'mockCredentialID',
        publicKey: Buffer.from('mockPublicKey'),
        webauthnUserID: 'mockUserID',
        counter: 0,
        transport: 'usb',
        deviceType: 'singleDevice',
        backedUp: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      (webauthn.verifyAuthenticationResponse as jest.Mock).mockResolvedValue(
        mockVerifyRegistrationResponse,
      );

      // Simulate the setting of options in the cache
      await cacheManager.set(
        verifyAuthenticationDto.email,
        mockedAuthOptions,
        300000,
      );

      const response = await request(httpServer)
        .post('/auth/webauthn/verify-authentication-response')
        .send(verifyAuthenticationDto);

      expect(response).toBeDefined();
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('verified', true);
      expect(webauthn.verifyAuthenticationResponse).toHaveBeenCalledWith({
        response: authenticationResponse,
        expectedChallenge: mockedAuthOptions.challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: 'mockCredentialID',
          publicKey: Buffer.from('mockPublicKey'),
          counter: 0,
          transports: ['usb'],
        },
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
