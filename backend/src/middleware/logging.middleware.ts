import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use = (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip;
    const method = req.method;
    const url = req.originalUrl;

    this.logger.log(`${ip} -> ${method} ${url}`);

    next();
  };
}
