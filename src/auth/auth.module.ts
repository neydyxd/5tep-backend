import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../users/profile.entity';
import { User } from '../users/user.entity';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginAttemptsService } from './login-attempts.service';
import { Session } from './session.entity';
import { SessionService } from './session.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Session])],
  controllers: [AuthController],
  providers: [AuthService, SessionService, LoginAttemptsService, AuthGuard],
  exports: [SessionService, AuthGuard],
})
export class AuthModule {}
