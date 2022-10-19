/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthConfirm } from 'src/contracts/auth/confirm';
import { AuthRegister } from 'src/contracts/auth/register';
import { Directus } from '@directus/sdk';
import { RMQError } from 'nestjs-rmq';
import { ERROR_TYPE } from 'nestjs-rmq/dist/constants';
import randomNumber = require("random-number");
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class AuthService {
  directus: any;
  constructor(
    private readonly jwtService: JwtService, 
    private readonly mailerService: MailerService
    ) {
    this.directus = new Directus(process.env.DIRECTUS_HOST, {
      auth: {
        staticToken: process.env.ADMIN_API_KEY, // If you want to use a static token, otherwise check below how you can use email and password.
      },
    });
  }

  login(
    id: any,
  ):
    | import('../contracts').AuthLogin.Response
    | PromiseLike<import('../contracts').AuthLogin.Response> {
    throw new Error('Method not implemented.');
  }

  validateUser(
    email: string,
    password: string,
  ): { id: any } | PromiseLike<{ id: any }> {
    throw new Error('Method not implemented.');
  }

  async confirm(dto: AuthConfirm.Request): Promise<AuthConfirm.Response> {

    const confirm_tokens = this.directus.items('confirm_tokens');
    const confirm_token = await confirm_tokens.readByQuery({
      filter: { token: dto.confirm_code },
      fields: 'id,token,payload',
    }).then(response => response.data.length ? response.data[0] : undefined);

    if (confirm_token !== undefined) {
      const users_collection = this.directus.items('users');
      const user_profiles_collection = this.directus.items('user_profiles');
      const user = await users_collection.createOne({
        password: confirm_token.payload.password,
        email: confirm_token.payload.email,
        confirmed: true,
      });
      await user_profiles_collection.createOne(
        {
          user_id: user.id,
          full_name: confirm_token.payload.fullName,
        }
      );
      await confirm_tokens.deleteOne(confirm_token.id);
      return { success: true };
    }
    throw new RMQError('Неверный код подтверждения', ERROR_TYPE.RMQ, 400);
  }

  async register(dto: AuthRegister.Request): Promise<AuthRegister.Response> {
    const confirm_tokens = this.directus.items('confirm_tokens');
    const users_collection = this.directus.items('users');

    const userAlreadyExist = await users_collection.readByQuery({
      filter: { email: dto.email },
      fields: 'id',
    }).then(response => response.data.length);

    if (userAlreadyExist) {
      throw new RMQError('Пользователь с таким E-mail уже существует!', ERROR_TYPE.RMQ, 400);
    }

    const createdToken = randomNumber({
      min:  100000, 
      max:  999999,
      integer: true
    }).toString();

    await confirm_tokens.createOne({
      token: createdToken,
      payload: JSON.stringify(dto),
    });

    await this.mailerService.sendConfirmation(createdToken, dto.email)

    return { success: true };
  }
}
