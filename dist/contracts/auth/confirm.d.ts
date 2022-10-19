export declare namespace AuthConfirm {
    const topic = "auth.confirm.command";
    class Request {
        confirm_code: string;
    }
    class Response {
        success: true;
    }
}
