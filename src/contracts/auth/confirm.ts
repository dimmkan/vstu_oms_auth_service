import { IsNotEmpty, IsString } from 'class-validator';

export namespace AuthConfirm {
  export const topic = 'auth.confirm.command';

  export class Request {
    @IsString()
    @IsNotEmpty()
    confirm_code: string;
  }

  export class Response {
    success: true;
  }
}
