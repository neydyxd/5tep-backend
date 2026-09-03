import { Matches, MaxLength, MinLength } from 'class-validator';
import {
  LOGIN_MAX_LENGTH,
  LOGIN_MIN_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../../users/user.entity';

export const LOGIN_PATTERN = /^[A-Za-z0-9._-]+$/;
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export class CredentialsDto {
  @MinLength(LOGIN_MIN_LENGTH)
  @MaxLength(LOGIN_MAX_LENGTH)
  @Matches(LOGIN_PATTERN, {
    message:
      'login must contain only latin letters, digits, dot, dash, underscore',
  })
  login: string;

  @MinLength(PASSWORD_MIN_LENGTH)
  @MaxLength(128)
  @Matches(PASSWORD_PATTERN, {
    message: 'password must contain at least one letter and one digit',
  })
  password: string;
}
