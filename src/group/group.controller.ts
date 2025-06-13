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
  UseGuards,
} from '@nestjs/common';
import {
  CreateGroupDto,
  UpdateGroupDto,
  GetGroupDetailsQueryDto,
  GetGroupListDto,
  GetGroupDetailsDto,
} from './dto';
import { IsAdminOfGroupGuard } from '../common/guards/is-admin.guard';

@Controller('group')
export class GroupController {
  constructor(private groupService: GroupService) {}

  @Post(':userId')
  createGroup(
    @Param('userId') userId: string,
    @Body() CreateGroupDto: CreateGroupDto,
  ): Promise<GetGroupListDto> {
    return this.groupService.createGroup(userId, CreateGroupDto);
  }

  // Get list of groups for a user
  @Get(':userId')
  getGroups(@Param('userId') userId: string): Promise<GetGroupListDto[]> {
    return this.groupService.getAllGroups(userId);
  }

  // Get details of a specific group
  @Get()
  getGroupDetails(
    @Query() query: GetGroupDetailsQueryDto,
  ): Promise<GetGroupDetailsDto> {
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

  // Update group
  @Patch(':userId/:groupId')
  @UseGuards(IsAdminOfGroupGuard)
  updateGroup(
    @Param('userId') userId: string,
    @Param('groupId') groupId: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<GetGroupListDto> {
    return this.groupService.updateGroup(userId, groupId, updateGroupDto);
  }
}
