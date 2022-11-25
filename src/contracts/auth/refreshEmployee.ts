export namespace AuthRefreshEmployee {
  export const topic = 'auth.refreshemployee.command';

  export class Request {
    id: number;
    key: string;
    ip: string;
    agent: string;
  }

  export class Response {
    access_token: string;
    refresh_token: string;
  }
}
