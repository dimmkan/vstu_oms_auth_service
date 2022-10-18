import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthConfirm } from 'src/contracts/auth/confirm';
import { AuthRegister } from 'src/contracts/auth/register';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(
    id: any,
  ):
    | import('../contracts').AuthLogin.Response
    | PromiseLike<import('../contracts').AuthLogin.Response> {
    throw new Error('Method not implemented.');
  }
  validateUser(
    email: string,
    password: string,
  ): { id: any } | PromiseLike<{ id: any }> {
    throw new Error('Method not implemented.');
  }
  confirm(dto: AuthConfirm.Request): Promise<AuthConfirm.Response> {
    return new Promise((resolve) =>
      resolve({ access_token: dto.confirm_code }),
    );
  }
  register(
    dto: AuthRegister.Request,
  ):
    | import('../contracts/auth/register').AuthRegister.Response
    | PromiseLike<import('../contracts/auth/register').AuthRegister.Response> {
    throw new Error('Method not implemented.');
  }
}
