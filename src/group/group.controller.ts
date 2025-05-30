import { GroupService } from './group.service';
import {
  Body,
  Controller,
  ParseIntPipe,
  Post,
  Delete,
  Param,
} from '@nestjs/common';
import { CreateGroupDto, GetGroupDto } from './dto';

@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Post(':userId')
  createGroup(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() CreateGroupDto: CreateGroupDto,
  ): Promise<GetGroupDto> {
    return this.groupService.createGroup(userId, CreateGroupDto);
  }

  // @Get(':userId')
  // getGroups(
  //   @Param('userId', ParseIntPipe) userId: number,
  // ): Promise<GetGroupDto[]> {
  //   return this.groupService.getAllGroups(userId);
  // }

  @Delete(':userId/:groupId')
  deleteGroup(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('groupId', ParseIntPipe) groupId: number,
  ): Promise<void> {
    return this.groupService.deleteGroup(userId, groupId);
  }
}
