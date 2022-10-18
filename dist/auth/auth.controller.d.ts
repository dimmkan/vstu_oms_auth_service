import { AuthService } from './auth.service';
import { AuthLogin } from '../contracts';
import { AuthRegister } from '../contracts';
import { AuthConfirm } from '../contracts';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: AuthRegister.Request): Promise<AuthRegister.Response>;
    confirm(dto: AuthConfirm.Request): Promise<AuthConfirm.Response>;
    login({ email, password }: AuthLogin.Request): Promise<AuthLogin.Response>;
}
