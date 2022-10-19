export namespace AuthConfirm {
  export const topic = 'auth.confirm.command';

  export class Request {
    confirm_code: string;
  }

  export class Response {
    success: true;
  }
}
