import { IsEmail, IsString } from 'class-validator';

export namespace AuthLogin {
  export const topic = 'auth.login.command';

  export class Request {
    @IsEmail()
    email: string;

    @IsString()
    password: string;

    @IsString()
    ip: string;

    @IsString()
    agent: string;
  }

  export class Response {
    access_token: string;
    refresh_token: string;
  }
}
