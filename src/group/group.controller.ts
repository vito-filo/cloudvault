import { GroupService } from './group.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  CreateGroupDto,
  GetGroupDto,
  UpdateGroupDto,
  GetGroupDetailsQueryDto,
} from './dto';

@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Post(':userId')
  createGroup(
    @Param('userId') userId: string,
    @Body() CreateGroupDto: CreateGroupDto,
  ): Promise<GetGroupDto> {
    return this.groupService.createGroup(userId, CreateGroupDto);
  }

  @Get(':userId')
  getGroups(@Param('userId') userId: string): Promise<GetGroupDto[]> {
    return this.groupService.getAllGroups(userId);
  }

  @Get()
  getGroupDetails(
    @Query() query: GetGroupDetailsQueryDto,
  ): Promise<GetGroupDto> {
    return this.groupService.getGroupDetails(query);
  }

  // Search user by name/email
  @Get('user/search/')
  searchUser(
    @Query('name') name: string,
  ): Promise<{ name: string | null; email: string }[]> {
    return this.groupService.searchUserByName(name);
  }

  @Delete(':userId/:groupId')
  deleteGroup(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
  ): Promise<void> {
    return this.groupService.deleteGroup(userId, groupId);
  }

  @Patch(':userId/:groupId')
  updateGroup(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<GetGroupDto> {
    return this.groupService.updateGroup(userId, groupId, updateGroupDto);
  }
}
