export declare namespace AuthLogout {
    const topic = "auth.logout.command";
    class Request {
        id: number;
        rId: number;
    }
    class Response {
        success: boolean;
    }
}
