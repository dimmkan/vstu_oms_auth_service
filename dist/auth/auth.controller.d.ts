import { AuthService } from './auth.service';
import { AuthLogin, AuthLogout, AuthRefresh } from '../contracts';
import { AuthRegister } from '../contracts';
import { AuthConfirm } from '../contracts';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: AuthRegister.Request): Promise<AuthRegister.Response>;
    confirm(dto: AuthConfirm.Request): Promise<AuthConfirm.Response>;
    login(dto: AuthLogin.Request): Promise<AuthLogin.Response>;
    refresh(dto: AuthRefresh.Request): Promise<AuthRefresh.Response>;
    logout(dto: AuthLogout.Request): Promise<AuthLogout.Response>;
}
