import { AuthService } from './auth.service';
import { AuthConfirmEmployee, AuthLogin, AuthLogout, AuthLogoutEmployee, AuthRefresh, AuthRefreshEmployee, AuthRegisterEmployee } from '../contracts';
import { AuthRegister } from '../contracts';
import { AuthConfirm } from '../contracts';
import { AuthLoginEmployee } from 'src/contracts/auth/loginEmployee';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: AuthRegister.Request): Promise<AuthRegister.Response>;
    confirm(dto: AuthConfirm.Request): Promise<AuthConfirm.Response>;
    login(dto: AuthLogin.Request): Promise<AuthLogin.Response>;
    refresh(dto: AuthRefresh.Request): Promise<AuthRefresh.Response>;
    logout(dto: AuthLogout.Request): Promise<AuthLogout.Response>;
    registerEmployee(dto: AuthRegisterEmployee.Request): Promise<AuthRegisterEmployee.Response>;
    confirmEmployee(dto: AuthConfirmEmployee.Request): Promise<AuthConfirmEmployee.Response>;
    loginEmployee(dto: AuthLoginEmployee.Request): Promise<AuthLoginEmployee.Response>;
    refreshEmployee(dto: AuthRefreshEmployee.Request): Promise<AuthRefreshEmployee.Response>;
    logoutEmployee(dto: AuthLogoutEmployee.Request): Promise<AuthLogoutEmployee.Response>;
}
