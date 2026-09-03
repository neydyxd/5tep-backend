import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  GOAL_STEPS_INCREMENT,
  GOAL_STEPS_MAX,
  GOAL_STEPS_MIN,
  HEIGHT_CM_MAX,
  HEIGHT_CM_MIN,
  PREFERRED_TIMES,
  WEIGHT_KG_MAX,
  WEIGHT_KG_MIN,
} from '../../users/profile.entity';
import type { PreferredTime } from '../../users/profile.entity';

export const GOAL_STEPS_OPTIONS = Array.from(
  { length: (GOAL_STEPS_MAX - GOAL_STEPS_MIN) / GOAL_STEPS_INCREMENT + 1 },
  (_value, index) => GOAL_STEPS_MIN + index * GOAL_STEPS_INCREMENT,
);

export class UpdateProfileDto {
  @IsOptional()
  @IsIn(GOAL_STEPS_OPTIONS)
  goalSteps?: number;

  @IsOptional()
  @IsInt()
  @Min(HEIGHT_CM_MIN)
  @Max(HEIGHT_CM_MAX)
  heightCm?: number;

  @IsOptional()
  @IsInt()
  @Min(WEIGHT_KG_MIN)
  @Max(WEIGHT_KG_MAX)
  weightKg?: number;

  @IsOptional()
  @IsIn(PREFERRED_TIMES)
  preferredTime?: PreferredTime;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3650)
  streakDays?: number;
}
