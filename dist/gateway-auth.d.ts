declare function gateway_auth(this: any, options: any): {
    exports: {};
};
declare namespace gateway_auth {
    var defaults: {
        spec: {
            azure_cookie: import("gubu").Node<{
                active: boolean;
                token: {
                    name: string;
                };
                user: {
                    auth: boolean;
                    require: boolean;
                };
            }>;
            express_cookie: import("gubu").Node<{
                active: boolean;
                token: {
                    name: string;
                };
                user: {
                    auth: boolean;
                    require: boolean;
                };
            }>;
            lambda_cookie: import("gubu").Node<{
                active: boolean;
                token: {
                    name: string;
                };
                user: {
                    auth: boolean;
                    require: boolean;
                };
            }>;
            lambda_cognito: import("gubu").Node<{
                active: boolean;
                user: {
                    auth: boolean;
                    require: boolean;
                };
            }>;
        };
        debug: boolean;
    };
}
export default gateway_auth;
