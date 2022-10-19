import { HttpService } from '@nestjs/axios';
export declare class MailerService {
    private readonly httpService;
    constructor(httpService: HttpService);
    sendConfirmation(createdToken: string, ToAddress: string): Promise<void>;
}
