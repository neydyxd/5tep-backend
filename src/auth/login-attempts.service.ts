import { Injectable } from '@nestjs/common';

export const ATTEMPT_WINDOW_MS = 60_000;
export const ATTEMPT_LIMIT = 5;

/**
 * Login throttling: at most five attempts per minute per login and per address.
 * The window lives in process memory, which covers a single instance behind a proxy;
 * horizontal scaling moves the counter to Redis under the same keys.
 */
@Injectable()
export class LoginAttemptsService {
  private readonly attempts = new Map<string, number[]>();

  /** Seconds until the next allowed attempt, or null while the limit is not reached. */
  retryAfter(keys: string[], now = Date.now()): number | null {
    let longestWait = 0;
    for (const key of keys) {
      const recent = this.recent(key, now);
      if (recent.length < ATTEMPT_LIMIT) {
        continue;
      }
      const oldest = recent[recent.length - ATTEMPT_LIMIT];
      longestWait = Math.max(longestWait, oldest + ATTEMPT_WINDOW_MS - now);
    }
    return longestWait > 0 ? Math.ceil(longestWait / 1000) : null;
  }

  register(keys: string[], now = Date.now()): void {
    for (const key of keys) {
      this.attempts.set(key, [...this.recent(key, now), now]);
    }
  }

  reset(keys: string[]): void {
    for (const key of keys) {
      this.attempts.delete(key);
    }
  }

  private recent(key: string, now: number): number[] {
    const hits = this.attempts.get(key) ?? [];
    const fresh = hits.filter((at) => now - at < ATTEMPT_WINDOW_MS);
    if (fresh.length !== hits.length) {
      this.attempts.set(key, fresh);
    }
    return fresh;
  }
}
