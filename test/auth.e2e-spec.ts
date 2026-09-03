import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { ValidationError } from 'class-validator';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { TooManyAttemptsFilter } from '../src/auth/too-many-attempts';
import { ATTEMPT_LIMIT } from '../src/auth/login-attempts.service';
import type { ProfileView, SessionView } from '../src/auth/auth.service';

const asSession = (body: unknown): SessionView => body as SessionView;
const asProfile = (body: unknown): ProfileView => body as ProfileView;

const PASSWORD = 'walk12345';

describe('Account flow (e2e)', () => {
  let app: NestExpressApplication;
  let server: string | ReturnType<NestExpressApplication['getHttpServer']>;
  let login: string;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestExpressApplication>();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors: ValidationError[]) =>
          new UnprocessableEntityException({
            statusCode: 422,
            fields: errors.map((error) => error.property),
          }),
      }),
    );
    app.useGlobalFilters(new TooManyAttemptsFilter());
    await app.init();
    server = app.getHttpServer();
    login = `walker${randomUUID().slice(0, 8)}`;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('registers an account and returns a default profile', async () => {
    const response = await request(server)
      .post('/auth/register')
      .send({ login, password: PASSWORD })
      .expect(201);

    expect(asSession(response.body).token).toEqual(expect.any(String));
    expect(asSession(response.body).profile).toEqual({
      goalSteps: 10000,
      heightCm: 170,
      weightKg: 70,
      preferredTime: 'evening',
      streakDays: 0,
    });
    expect(JSON.stringify(response.body)).not.toContain(PASSWORD);
    token = asSession(response.body).token;
  });

  it('refuses the same login regardless of case', async () => {
    await request(server)
      .post('/auth/register')
      .send({ login: login.toUpperCase(), password: PASSWORD })
      .expect(409);
  });

  it('refuses a password without digits and a malformed login', async () => {
    await request(server)
      .post('/auth/register')
      .send({ login: `${login}x`, password: 'onlyletters' })
      .expect(422);
    await request(server)
      .post('/auth/register')
      .send({ login: 'кириллица', password: PASSWORD })
      .expect(422);
  });

  it('serves and updates the profile for a valid token only', async () => {
    await request(server).get('/profile').expect(401);
    await request(server)
      .get('/profile')
      .set('Authorization', 'Bearer not-a-real-token')
      .expect(401);

    const updated = await request(server)
      .patch('/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        goalSteps: 12000,
        heightCm: 178,
        weightKg: 74,
        preferredTime: 'morning',
      })
      .expect(200);
    expect(updated.body).toMatchObject({
      goalSteps: 12000,
      heightCm: 178,
      weightKg: 74,
      preferredTime: 'morning',
    });

    const fetched = await request(server)
      .get('/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(asProfile(fetched.body).goalSteps).toBe(12000);
  });

  it('rejects values outside the ranges from the specification', async () => {
    const authorized = { Authorization: `Bearer ${token}` };
    await request(server)
      .patch('/profile')
      .set(authorized)
      .send({ goalSteps: 12500 })
      .expect(422);
    await request(server)
      .patch('/profile')
      .set(authorized)
      .send({ heightCm: 99 })
      .expect(422);
    await request(server)
      .patch('/profile')
      .set(authorized)
      .send({ weightKg: 251 })
      .expect(422);
    await request(server)
      .patch('/profile')
      .set(authorized)
      .send({ preferredTime: 'night' })
      .expect(422);
  });

  it('signs in with the stored password and drops the token on logout', async () => {
    const signedIn = await request(server)
      .post('/auth/login')
      .send({ login: login.toUpperCase(), password: PASSWORD })
      .expect(200);
    const second = asSession(signedIn.body).token;
    expect(second).not.toBe(token);
    expect(asSession(signedIn.body).profile.goalSteps).toBe(12000);

    await request(server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${second}`)
      .expect(204);
    await request(server)
      .get('/profile')
      .set('Authorization', `Bearer ${second}`)
      .expect(401);
    // Another session of the same user is untouched by the logout.
    await request(server)
      .get('/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('deletes the account with its profile and sessions', async () => {
    await request(server)
      .delete('/account')
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    await request(server)
      .get('/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
    await request(server)
      .post('/auth/login')
      .send({ login, password: PASSWORD })
      .expect(401);
  });

  it('answers 401 identically for an unknown login, then locks the address', async () => {
    const unknown = `ghost${randomUUID().slice(0, 8)}`;
    const wrong = await request(server)
      .post('/auth/login')
      .send({ login: unknown, password: PASSWORD })
      .expect(401);
    expect((wrong.body as { message: string }).message).toBe(
      'Invalid login or password',
    );

    // Tests share one address and earlier checks already spent some attempts,
    // so 429 is expected within ATTEMPT_LIMIT requests at the latest.
    const statuses: number[] = [];
    for (let attempt = 0; attempt <= ATTEMPT_LIMIT; attempt += 1) {
      const response = await request(server)
        .post('/auth/login')
        .send({ login: unknown, password: PASSWORD });
      statuses.push(response.status);
      if (response.status === 429) {
        expect(Number(response.headers['retry-after'])).toBeGreaterThan(0);
        break;
      }
    }

    expect(statuses).toContain(429);
    expect(
      statuses.filter((status) => status !== 401 && status !== 429),
    ).toHaveLength(0);
  });
});
