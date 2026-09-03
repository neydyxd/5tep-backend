import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Session } from './auth/session.entity';
import { ProfileModule } from './profile/profile.module';
import { Profile } from './users/profile.entity';
import { User } from './users/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USER', 'fivestep'),
        password: config.get<string>('DB_PASSWORD', 'fivestep'),
        database: config.get<string>('DB_NAME', 'fivestep'),
        entities: [User, Profile, Session],
        // Schema changes only through migrations: auto-sync loses data on a live database.
        synchronize: false,
        logging: ['error', 'warn'],
      }),
    }),
    // Blanket protection for every endpoint; sign-in is limited separately and stricter.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    AuthModule,
    ProfileModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
