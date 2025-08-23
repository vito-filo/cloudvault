import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
  params: {
    groupId: string;
  };
}

@Injectable()
export class IsAdminOfGroupGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get request params
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const userId = request.user.sub;

    const groupId = request.params.groupId;

    if (!userId || !groupId) {
      return false;
    }

    const isAdmin = await this.prisma.isAdminOfGroup(userId, groupId);

    return isAdmin;
  }
}
