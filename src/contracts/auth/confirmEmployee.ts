import { IsNotEmpty, IsString } from 'class-validator';

export namespace AuthConfirmEmployee {
  export const topic = 'auth.confirmemployee.command';

  export class Request {
    @IsString()
    @IsNotEmpty()
    confirm_code: string;
  }

  export class Response {
    success: true;
  }
}
