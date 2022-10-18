import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLogin } from '../contracts';
import { AuthRegister } from '../contracts';
import { AuthConfirm } from '../contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RMQRoute(AuthRegister.topic)
  @RMQValidate()
  async register(
    @Body() dto: AuthRegister.Request,
  ): Promise<AuthRegister.Response> {
    return this.authService.register(dto);
  }

  @RMQRoute(AuthConfirm.topic)
  @RMQValidate()
  async confirm(
    @Body() dto: AuthConfirm.Request,
  ): Promise<AuthConfirm.Response> {
    return this.authService.confirm(dto);
  }

  @RMQRoute(AuthLogin.topic)
  @RMQValidate()
  async login(
    @Body() { email, password }: AuthLogin.Request,
  ): Promise<AuthLogin.Response> {
    const { id } = await this.authService.validateUser(email, password);
    return this.authService.login(id);
  }
}
