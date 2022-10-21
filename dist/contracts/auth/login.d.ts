export declare namespace AuthLogin {
    const topic = "auth.login.command";
    class Request {
        email: string;
        password: string;
        ip: string;
        agent: string;
    }
    class Response {
        access_token: string;
        refresh_token: string;
    }
}
