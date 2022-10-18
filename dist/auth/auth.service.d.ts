import { JwtService } from '@nestjs/jwt';
import { AuthConfirm } from 'src/contracts/auth/confirm';
import { AuthRegister } from 'src/contracts/auth/register';
export declare class AuthService {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    login(id: any): import('../contracts').AuthLogin.Response | PromiseLike<import('../contracts').AuthLogin.Response>;
    validateUser(email: string, password: string): {
        id: any;
    } | PromiseLike<{
        id: any;
    }>;
    confirm(dto: AuthConfirm.Request): Promise<AuthConfirm.Response>;
    register(dto: AuthRegister.Request): import('../contracts/auth/register').AuthRegister.Response | PromiseLike<import('../contracts/auth/register').AuthRegister.Response>;
}
