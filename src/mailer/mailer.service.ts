import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MailerService {
  constructor(private readonly httpService: HttpService) {}

  async sendConfirmation(createdToken: string, ToAddress: string) {
    const htmlText = `
    <h3>Завершение регистрации<h3>
    Для завершения регистрации аккаунта перейдите по <a href=${process.env.GATEWAY_HOST}/auth/register/confirm/${createdToken}>ссылке</a>
    `;

    const data = {
      apiKey: process.env.EMAIL_TOKEN,
      Subject: 'Завершение регистрации',
      Body: htmlText,
      FromAddress: 'kandmi@rarus.ru',
      ToAddress,
    };
    await lastValueFrom(
      this.httpService.post(`${process.env.EMAIL_HOST}/singleEmail`, data),
    );
  }

  async sendConfirmationEmployee(createdToken: string, ToAddress: string) {
    const htmlText = `
    <h3>Завершение регистрации<h3>
    Для завершения регистрации аккаунта перейдите по <a href=${process.env.GATEWAY_HOST}/auth/employee/register/confirm/${createdToken}>ссылке</a>
    `;

    const data = {
      apiKey: process.env.EMAIL_TOKEN,
      Subject: 'Завершение регистрации',
      Body: htmlText,
      FromAddress: 'kandmi@rarus.ru',
      ToAddress,
    };
    await lastValueFrom(
      this.httpService.post(`${process.env.EMAIL_HOST}/singleEmail`, data),
    );
  }
}
