export declare namespace AuthLogoutEmployee {
    const topic = "auth.logoutemployee.command";
    class Request {
        id: number;
        rId: number;
    }
    class Response {
        success: boolean;
    }
}
