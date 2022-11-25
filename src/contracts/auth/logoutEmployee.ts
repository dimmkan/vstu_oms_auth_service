export namespace AuthLogoutEmployee {
  export const topic = 'auth.logoutemployee.command';

  export class Request {
    id: number;
    rId: number;
  }

  export class Response {
    success: boolean;
  }
}
