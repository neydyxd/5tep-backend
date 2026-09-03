import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { DataSource, Repository } from 'typeorm';
import { Profile } from '../users/profile.entity';
import { User } from '../users/user.entity';
import { CredentialsDto } from './dto/credentials.dto';
import { LoginAttemptsService } from './login-attempts.service';
import { SessionService } from './session.service';
import { TooManyAttemptsException } from './too-many-attempts';

// Argon2id parameters follow the OWASP recommendation: 19 MiB of memory, two passes.
const ARGON2_OPTIONS: argon2.HashOptions = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

export interface ProfileView {
  goalSteps: number;
  heightCm: number;
  weightKg: number;
  preferredTime: string;
  streakDays: number;
}

export interface SessionView {
  token: string;
  userId: string;
  login: string;
  profile: ProfileView;
}

export function toProfileView(profile: Profile): ProfileView {
  return {
    goalSteps: profile.goalSteps,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    preferredTime: profile.preferredTime,
    streakDays: profile.streakDays,
  };
}

@Injectable()
export class AuthService {
  private decoyHash?: Promise<string>;

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly sessions: SessionService,
    private readonly attempts: LoginAttemptsService,
  ) {}

  async register(credentials: CredentialsDto): Promise<SessionView> {
    if (await this.loginTaken(credentials.login)) {
      throw new ConflictException('Login is already taken');
    }

    const passwordHash = await argon2.hash(
      credentials.password,
      ARGON2_OPTIONS,
    );
    const { user, profile } = await this.dataSource.transaction(
      async (manager) => {
        const created = await manager.save(
          manager.create(User, { login: credentials.login, passwordHash }),
        );
        const createdProfile = await manager.save(
          manager.create(Profile, { userId: created.id }),
        );
        return { user: created, profile: createdProfile };
      },
    );

    return {
      token: await this.sessions.issue(user.id),
      userId: user.id,
      login: user.login,
      profile: toProfileView(profile),
    };
  }

  async login(credentials: CredentialsDto, ip: string): Promise<SessionView> {
    const keys = [`login:${credentials.login.toLowerCase()}`, `ip:${ip}`];
    const retryAfter = this.attempts.retryAfter(keys);
    if (retryAfter !== null) {
      throw new TooManyAttemptsException(retryAfter);
    }

    const user = await this.users
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where('lower(user.login) = lower(:login)', { login: credentials.login })
      .getOne();

    // The password is verified even when the login is missing: otherwise response
    // timing reveals existing logins, while the answer has to stay identical.
    const passwordMatches = await argon2
      .verify(user?.passwordHash ?? (await this.decoy()), credentials.password)
      .catch(() => false);

    if (!user || !passwordMatches) {
      this.attempts.register(keys);
      throw new UnauthorizedException('Invalid login or password');
    }

    this.attempts.reset(keys);
    return {
      token: await this.sessions.issue(user.id),
      userId: user.id,
      login: user.login,
      profile: toProfileView(user.profile),
    };
  }

  async logout(token: string): Promise<void> {
    await this.sessions.revoke(token);
  }

  private async loginTaken(login: string): Promise<boolean> {
    return this.users
      .createQueryBuilder('user')
      .where('lower(user.login) = lower(:login)', { login })
      .getExists();
  }

  private decoy(): Promise<string> {
    this.decoyHash ??= argon2.hash('login-does-not-exist', ARGON2_OPTIONS);
    return this.decoyHash;
  }
}
