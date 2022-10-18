export declare namespace AuthRegister {
    const topic = "auth.register.command";
    class Request {
        email: string;
        password: string;
        fullName: string;
    }
    class Response {
        success: boolean;
    }
}
