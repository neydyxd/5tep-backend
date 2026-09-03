import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, SessionToken } from './auth.guard';
import { AuthService, SessionView } from './auth.service';
import { CredentialsDto } from './dto/credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() credentials: CredentialsDto): Promise<SessionView> {
    return this.auth.register(credentials);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() credentials: CredentialsDto,
    @Ip() ip: string,
  ): Promise<SessionView> {
    return this.auth.login(credentials, ip);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard)
  logout(@SessionToken() token: string): Promise<void> {
    return this.auth.logout(token);
  }
}
