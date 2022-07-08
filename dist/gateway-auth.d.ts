declare function gateway_auth(this: any, options: any): {
    exports: {};
};
declare namespace gateway_auth {
    var defaults: {
        spec: {
            express_cookie: import("gubu").Node & {
                [name: string]: any;
            };
            stytch: import("gubu").Node & {
                [name: string]: any;
            };
        };
        debug: boolean;
    };
}
export default gateway_auth;
