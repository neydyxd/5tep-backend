import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUserId } from '../auth/auth.guard';
import { ProfileView } from '../auth/auth.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Controller()
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}

  @Get('profile')
  get(@CurrentUserId() userId: string): Promise<ProfileView> {
    return this.profiles.get(userId);
  }

  @Patch('profile')
  update(
    @CurrentUserId() userId: string,
    @Body() changes: UpdateProfileDto,
  ): Promise<ProfileView> {
    return this.profiles.update(userId, changes);
  }

  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAccount(@CurrentUserId() userId: string): Promise<void> {
    return this.profiles.deleteAccount(userId);
  }
}
