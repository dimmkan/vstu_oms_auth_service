export declare namespace AuthRefresh {
    const topic = "auth.refresh.command";
    class Request {
        id: number;
        key: string;
        ip: string;
        agent: string;
    }
    class Response {
        access_token: string;
        refresh_token: string;
    }
}
