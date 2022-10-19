import { JwtService } from '@nestjs/jwt';
import { AuthConfirm } from 'src/contracts/auth/confirm';
import { AuthRegister } from 'src/contracts/auth/register';
import { MailerService } from 'src/mailer/mailer.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly mailerService;
    directus: any;
    constructor(jwtService: JwtService, mailerService: MailerService);
    login(id: any): import('../contracts').AuthLogin.Response | PromiseLike<import('../contracts').AuthLogin.Response>;
    validateUser(email: string, password: string): {
        id: any;
    } | PromiseLike<{
        id: any;
    }>;
    confirm(dto: AuthConfirm.Request): Promise<AuthConfirm.Response>;
    register(dto: AuthRegister.Request): Promise<AuthRegister.Response>;
}
