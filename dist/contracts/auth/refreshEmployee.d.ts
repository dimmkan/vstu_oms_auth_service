export declare namespace AuthRefreshEmployee {
    const topic = "auth.refreshemployee.command";
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
