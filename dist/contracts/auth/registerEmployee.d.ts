export declare namespace AuthRegisterEmployee {
    const topic = "auth.registeremployee.command";
    class Request {
        email: string;
        password: string;
        fullName: string;
    }
    class Response {
        success: boolean;
    }
}
