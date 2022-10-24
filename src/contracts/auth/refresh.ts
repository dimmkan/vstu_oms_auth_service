import { IsNumber, IsString } from 'class-validator';

export namespace AuthRefresh {
  export const topic = 'auth.refresh.command';

  export class Request {
    @IsNumber()
    id: number;

    @IsString()
    key: string;

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
