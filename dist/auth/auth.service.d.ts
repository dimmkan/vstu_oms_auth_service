import { JwtService } from '@nestjs/jwt';
import { AuthConfirm } from 'src/contracts/auth/confirm';
import { AuthRegister } from 'src/contracts/auth/register';
import { MailerService } from 'src/mailer/mailer.service';
import { AuthLogin } from '../contracts';
export declare class AuthService {
    private readonly jwtService;
    private readonly mailerService;
    directus: any;
    constructor(jwtService: JwtService, mailerService: MailerService);
    login(id: number, ip: string, agent: string): Promise<AuthLogin.Response>;
    validateUser(email: string, password: string): Promise<{
        id: number;
    }>;
    confirm(dto: AuthConfirm.Request): Promise<AuthConfirm.Response>;
    register(dto: AuthRegister.Request): Promise<AuthRegister.Response>;
    validateUserBeforeRegistry(email: string): Promise<void>;
    deleteUnusedConfirmTokens(): Promise<void>;
    validateConfirmToken(item: any): boolean;
}
