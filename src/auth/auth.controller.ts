import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthConfirmEmployee,
  AuthLogin,
  AuthLogout,
  AuthLogoutEmployee,
  AuthRefresh,
  AuthRefreshEmployee,
  AuthRegisterEmployee,
} from '../contracts';
import { AuthRegister } from '../contracts';
import { AuthConfirm } from '../contracts';
import { RMQRoute, RMQValidate } from 'nestjs-rmq';
import { AuthLoginEmployee } from 'src/contracts/auth/loginEmployee';

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
  async login(@Body() dto: AuthLogin.Request): Promise<AuthLogin.Response> {
    const { id } = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(id, dto.ip, dto.agent);
  }

  @RMQRoute(AuthRefresh.topic)
  @RMQValidate()
  async refresh(
    @Body() dto: AuthRefresh.Request,
  ): Promise<AuthRefresh.Response> {
    return this.authService.refresh(dto);
  }

  @RMQRoute(AuthLogout.topic)
  @RMQValidate()
  async logout(@Body() dto: AuthLogout.Request): Promise<AuthLogout.Response> {
    return this.authService.logout(dto);
  }

  @RMQRoute(AuthRegisterEmployee.topic)
  @RMQValidate()
  async registerEmployee(
    @Body() dto: AuthRegisterEmployee.Request,
  ): Promise<AuthRegisterEmployee.Response> {
    return this.authService.registerEmployee(dto);
  }

  @RMQRoute(AuthConfirmEmployee.topic)
  @RMQValidate()
  async confirmEmployee(
    @Body() dto: AuthConfirmEmployee.Request,
  ): Promise<AuthConfirmEmployee.Response> {
    return this.authService.confirmEmployee(dto);
  }

  @RMQRoute(AuthLoginEmployee.topic)
  @RMQValidate()
  async loginEmployee(
    @Body() dto: AuthLoginEmployee.Request,
  ): Promise<AuthLoginEmployee.Response> {
    const { id } = await this.authService.validateEmployee(
      dto.email,
      dto.password,
    );
    return this.authService.loginEmployee(id, dto.ip, dto.agent);
  }

  @RMQRoute(AuthRefreshEmployee.topic)
  @RMQValidate()
  async refreshEmployee(
    @Body() dto: AuthRefreshEmployee.Request,
  ): Promise<AuthRefreshEmployee.Response> {
    return this.authService.refreshEmployee(dto);
  }

  @RMQRoute(AuthLogoutEmployee.topic)
  @RMQValidate()
  async logoutEmployee(
    @Body() dto: AuthLogoutEmployee.Request,
  ): Promise<AuthLogoutEmployee.Response> {
    return this.authService.logoutEmployee(dto);
  }
}
