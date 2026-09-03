import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export const PREFERRED_TIMES = [
  'morning',
  'midday',
  'evening',
  'late-evening',
] as const;

export type PreferredTime = (typeof PREFERRED_TIMES)[number];

export const GOAL_STEPS_MIN = 3000;
export const GOAL_STEPS_MAX = 30000;
export const GOAL_STEPS_INCREMENT = 1000;
export const HEIGHT_CM_MIN = 100;
export const HEIGHT_CM_MAX = 230;
export const WEIGHT_KG_MIN = 30;
export const WEIGHT_KG_MAX = 250;

@Entity('profiles')
export class Profile {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'goal_steps', type: 'int', default: 10000 })
  goalSteps: number;

  @Column({ name: 'height_cm', type: 'int', default: 170 })
  heightCm: number;

  @Column({ name: 'weight_kg', type: 'int', default: 70 })
  weightKg: number;

  @Column({
    name: 'preferred_time',
    type: 'varchar',
    length: 16,
    default: 'evening',
  })
  preferredTime: PreferredTime;

  // The streak is computed on the device from local day history; it is stored here
  // so it can travel with the profile to another device (sync, release 2.0).
  @Column({ name: 'streak_days', type: 'int', default: 0 })
  streakDays: number;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
