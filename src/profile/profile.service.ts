import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileView, toProfileView } from '../auth/auth.service';
import { Profile } from '../users/profile.entity';
import { User } from '../users/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profiles: Repository<Profile>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async get(userId: string): Promise<ProfileView> {
    return toProfileView(await this.require(userId));
  }

  async update(
    userId: string,
    changes: UpdateProfileDto,
  ): Promise<ProfileView> {
    const profile = await this.require(userId);
    Object.assign(profile, changes);
    return toProfileView(await this.profiles.save(profile));
  }

  /** Profile and sessions go away with the user through database-level cascades. */
  async deleteAccount(userId: string): Promise<void> {
    const result = await this.users.delete({ id: userId });
    if (!result.affected) {
      throw new NotFoundException();
    }
  }

  private async require(userId: string): Promise<Profile> {
    const profile = await this.profiles.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException();
    }
    return profile;
  }
}
