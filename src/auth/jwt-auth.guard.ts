import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly client: jwksClient.JwksClient;
  private readonly ISSUER: string;

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] =
      request.headers.get('authorization')?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private getKey = (header: JwtHeader, callback: SigningKeyCallback): void => {
    this.client.getSigningKey(header.kid, (err, key) => {
      const signingKey = key?.getPublicKey();
      callback(err, signingKey);
    });
  };

  constructor(private readonly configService: ConfigService) {
    const USER_POOL_ID = this.configService.get<string>(
      'USER_POOL_ID',
      'undefined',
    );
    const REGION = this.configService.get<string>('REGION', 'undefined');
    const ISSUER = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`;
    this.client = jwksClient({
      jwksUri: `${ISSUER}/${USER_POOL_ID}/.well-known/jwks.json`,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 10 * 60 * 1000, // 10 min
      rateLimit: true,
      jwksRequestsPerMinute: 5,
    });
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // const request = context.switchToHttp().getRequest();

    // const token = this.extractTokenFromHeader(request);
    // if (!token) {
    //   throw new UnauthorizedException();
    // }

    // const verifyOptions: jwt.VerifyOptions = {
    //   algorithms: ['RS256'],
    //   issuer: this.ISSUER,
    // };

    // try {
    //   const payload = jwt.verify(
    //     token,
    //     this.getKey,
    //     verifyOptions,
    //     (err, decoded) => {
    //       if (err) {
    //         throw new UnauthorizedException('Invalid token');
    //       }
    //       return decoded;
    //     },
    //   );
    //   request.user = payload;
    // } catch {
    //   throw new UnauthorizedException('Invalid token');
    // }
    return true;
  }
}
