export declare namespace AuthLoginEmployee {
    const topic = "auth.loginemployee.command";
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
