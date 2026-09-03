import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import type { DataSource, Repository } from 'typeorm';
import { Profile } from '../users/profile.entity';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
import { ATTEMPT_LIMIT, LoginAttemptsService } from './login-attempts.service';
import type { SessionService } from './session.service';
import { TooManyAttemptsException } from './too-many-attempts';

const CREDENTIALS = { login: 'Walker', password: 'walk12345' };
const IP = '203.0.113.7';

describe('AuthService', () => {
  let auth: AuthService;
  let attempts: LoginAttemptsService;
  let saved: Partial<User>[];
  let existingUser: User | null;
  let loginTaken: boolean;

  beforeEach(() => {
    saved = [];
    existingUser = null;
    loginTaken = false;

    const builder = {
      leftJoinAndSelect: () => builder,
      where: () => builder,
      getOne: () => Promise.resolve(existingUser),
      getExists: () => Promise.resolve(loginTaken),
    };
    const users = {
      createQueryBuilder: () => builder,
    } as unknown as Repository<User>;

    const manager = {
      create: (_entity: unknown, plain: Record<string, unknown>) => plain,
      save: (plain: Record<string, unknown>) => {
        saved.push(plain);
        return Promise.resolve({ id: 'user-1', ...plain });
      },
    };
    const dataSource = {
      transaction: (work: (m: typeof manager) => unknown) => work(manager),
    } as unknown as DataSource;

    const sessions = {
      issue: () => Promise.resolve('session-token'),
      revoke: () => Promise.resolve(),
    } as unknown as SessionService;

    attempts = new LoginAttemptsService();
    auth = new AuthService(users, dataSource, sessions, attempts);
  });

  async function existingWalker(password: string): Promise<void> {
    existingUser = {
      id: 'user-1',
      login: 'Walker',
      passwordHash: await argon2.hash(password, { type: argon2.argon2id }),
      createdAt: new Date(),
      profile: { streakDays: 0, goalSteps: 10000 } as Profile,
    };
  }

  it('stores an argon2id hash and never the password itself', async () => {
    const result = await auth.register(CREDENTIALS);

    const user = saved[0];
    expect(user.passwordHash).toMatch(/^\$argon2id\$/);
    expect(JSON.stringify(saved)).not.toContain(CREDENTIALS.password);
    expect(await argon2.verify(user.passwordHash!, CREDENTIALS.password)).toBe(
      true,
    );
    expect(result).toMatchObject({ token: 'session-token', userId: 'user-1' });
    expect(result.profile.goalSteps).toBeUndefined();
  });

  it('rejects a login that is already taken', async () => {
    loginTaken = true;
    await expect(auth.register(CREDENTIALS)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(saved).toHaveLength(0);
  });

  it('answers the same way for a wrong password and for a missing login', async () => {
    await existingWalker('another12345');
    const wrongPassword = await auth
      .login(CREDENTIALS, IP)
      .catch((error: Error) => error);

    existingUser = null;
    const missingLogin = await auth
      .login(CREDENTIALS, IP)
      .catch((error: Error) => error);

    expect(wrongPassword).toBeInstanceOf(UnauthorizedException);
    expect(missingLogin).toBeInstanceOf(UnauthorizedException);
    expect((missingLogin as UnauthorizedException).getResponse()).toEqual(
      (wrongPassword as UnauthorizedException).getResponse(),
    );
  });

  it('locks the login after five failed attempts and reports the wait', async () => {
    await existingWalker('another12345');
    for (let attempt = 0; attempt < ATTEMPT_LIMIT; attempt += 1) {
      await expect(auth.login(CREDENTIALS, IP)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    }

    const locked = await auth
      .login(CREDENTIALS, IP)
      .catch((error: Error) => error);
    expect(locked).toBeInstanceOf(TooManyAttemptsException);
    expect((locked as TooManyAttemptsException).retryAfter).toBeGreaterThan(0);
  });

  it('issues a token and forgets earlier failures on success', async () => {
    await existingWalker(CREDENTIALS.password);
    attempts.register([`login:${CREDENTIALS.login.toLowerCase()}`, `ip:${IP}`]);

    const result = await auth.login(CREDENTIALS, IP);

    expect(result.token).toBe('session-token');
    expect(result.login).toBe('Walker');
    expect(attempts.retryAfter([`login:walker`, `ip:${IP}`])).toBeNull();
  });

  it('accepts a login in a different case than it was registered', async () => {
    await existingWalker(CREDENTIALS.password);
    const result = await auth.login({ ...CREDENTIALS, login: 'WALKER' }, IP);
    expect(result.userId).toBe('user-1');
  });
});
