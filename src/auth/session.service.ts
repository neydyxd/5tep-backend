import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'node:crypto';
import { LessThan, Repository } from 'typeorm';
import { Session } from './session.entity';

const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class SessionService {
  private readonly ttlDays: number;
  private readonly renewAfterDays: number;

  constructor(
    @InjectRepository(Session)
    private readonly sessions: Repository<Session>,
    config: ConfigService,
  ) {
    this.ttlDays = Number(config.get('SESSION_TTL_DAYS') ?? 30);
    this.renewAfterDays = Number(config.get('SESSION_RENEW_AFTER_DAYS') ?? 5);
  }

  static hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async issue(userId: string): Promise<string> {
    const token = randomBytes(32).toString('base64url');
    const now = new Date();
    await this.sessions.save(
      this.sessions.create({
        userId,
        tokenHash: SessionService.hash(token),
        expiresAt: new Date(now.getTime() + this.ttlDays * DAY_MS),
        lastSeenAt: now,
      }),
    );
    return token;
  }

  /** Returns the owner of a live session and extends it on activity. */
  async resolve(token: string): Promise<string | null> {
    const session = await this.sessions.findOne({
      where: { tokenHash: SessionService.hash(token) },
    });
    if (!session) {
      return null;
    }
    const now = new Date();
    if (session.expiresAt.getTime() <= now.getTime()) {
      await this.sessions.delete({ id: session.id });
      return null;
    }
    const daysLeft = (session.expiresAt.getTime() - now.getTime()) / DAY_MS;
    session.lastSeenAt = now;
    if (daysLeft < this.ttlDays - this.renewAfterDays) {
      session.expiresAt = new Date(now.getTime() + this.ttlDays * DAY_MS);
    }
    await this.sessions.save(session);
    return session.userId;
  }

  async revoke(token: string): Promise<void> {
    await this.sessions.delete({ tokenHash: SessionService.hash(token) });
  }

  async dropExpired(now = new Date()): Promise<number> {
    const result = await this.sessions.delete({ expiresAt: LessThan(now) });
    return result.affected ?? 0;
  }
}
