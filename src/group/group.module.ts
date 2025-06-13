import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { IsAdminOfGroupGuard } from '../common/guards/is-admin.guard';

@Module({
  controllers: [GroupController],
  providers: [GroupService, IsAdminOfGroupGuard],
})
export class GroupModule {}
