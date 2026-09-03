import {
  ATTEMPT_LIMIT,
  ATTEMPT_WINDOW_MS,
  LoginAttemptsService,
} from './login-attempts.service';

describe('LoginAttemptsService', () => {
  const keys = ['login:walker', 'ip:203.0.113.7'];
  let attempts: LoginAttemptsService;

  beforeEach(() => {
    attempts = new LoginAttemptsService();
  });

  it('allows attempts up to the limit', () => {
    for (let index = 0; index < ATTEMPT_LIMIT; index += 1) {
      expect(attempts.retryAfter(keys, 1000)).toBeNull();
      attempts.register(keys, 1000);
    }
    expect(attempts.retryAfter(keys, 1000)).toBe(ATTEMPT_WINDOW_MS / 1000);
  });

  it('releases the lock once the window has passed', () => {
    for (let index = 0; index < ATTEMPT_LIMIT; index += 1) {
      attempts.register(keys, 1000);
    }
    expect(attempts.retryAfter(keys, 1000 + ATTEMPT_WINDOW_MS - 1000)).toBe(1);
    expect(attempts.retryAfter(keys, 1000 + ATTEMPT_WINDOW_MS)).toBeNull();
  });

  it('counts login and address separately', () => {
    const sameLoginOtherAddress = ['login:walker', 'ip:198.51.100.4'];
    for (let index = 0; index < ATTEMPT_LIMIT; index += 1) {
      attempts.register(['ip:203.0.113.7'], 1000);
    }
    expect(attempts.retryAfter(keys, 1000)).toBe(ATTEMPT_WINDOW_MS / 1000);
    expect(attempts.retryAfter(sameLoginOtherAddress, 1000)).toBeNull();
  });

  it('forgets attempts after a successful login', () => {
    for (let index = 0; index < ATTEMPT_LIMIT; index += 1) {
      attempts.register(keys, 1000);
    }
    attempts.reset(keys);
    expect(attempts.retryAfter(keys, 1000)).toBeNull();
  });
});
