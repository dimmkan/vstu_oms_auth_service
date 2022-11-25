export declare namespace AuthConfirmEmployee {
    const topic = "auth.confirmemployee.command";
    class Request {
        confirm_code: string;
    }
    class Response {
        success: true;
    }
}
