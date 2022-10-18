export declare namespace AuthLogin {
    const topic = "auth.login.command";
    class Request {
        email: string;
        password: string;
    }
    class Response {
        access_token: string;
    }
}
