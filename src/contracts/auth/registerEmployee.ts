export namespace AuthRegisterEmployee {
  export const topic = 'auth.registeremployee.command';

  export class Request {
    email: string;
    password: string;
    fullName: string;
  }

  export class Response {
    success: boolean;
  }
}
