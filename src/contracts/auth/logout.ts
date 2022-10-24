import { IsNumber } from 'class-validator';

export namespace AuthLogout {
  export const topic = 'auth.logout.command';

  export class Request {
    @IsNumber()
    id: number;

    @IsNumber()
    rId: number;
  }

  export class Response {
    success: boolean;
  }
}
