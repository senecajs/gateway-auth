declare function gateway_auth(this: any, options: any): {
    exports: {};
};
declare namespace gateway_auth {
    var defaults: {
        gateway: {
            express: {
                active: boolean;
                token: {
                    name: string;
                };
                user: {
                    auth: boolean;
                    require: boolean;
                };
            };
        };
        debug: boolean;
    };
}
export default gateway_auth;
