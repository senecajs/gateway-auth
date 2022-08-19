"use strict";
/* Copyright © 2021-2022 Richard Rodger, MIT License. */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_1 = __importDefault(require("cookie"));
const gubu_1 = require("gubu");
function gateway_auth(options) {
    const seneca = this;
    this.prepare(async function () {
        for (let specname in options.spec) {
            if (options.spec[specname].active) {
                let spec = prepareSpec[specname];
                if (!spec) {
                    seneca.fail('unknown-auth-spec', specname);
                }
                await spec
                    .call(this, options.spec[specname], options);
            }
        }
    });
    return {
        exports: {}
    };
}
const prepareSpec = {
    express_cookie: prepare_express_cookie,
    lambda_cookie: prepare_lambda_cookie,
    lambda_cognito: prepare_lambda_cognito,
};
async function prepare_express_cookie(spec, _options) {
    const seneca = this;
    const root = seneca.root;
    const cookieName = spec.token.name;
    if (spec.user.auth) {
        seneca.act('sys:gateway,add:hook,hook:custom', {
            gateway: 'express',
            tag: seneca.plugin.tag,
            action: async function expressCookieUser(custom, _json, ctx) {
                var _a;
                // TODO: abstract cookie read as an option-defined function
                const token = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.req) === null || _a === void 0 ? void 0 : _a.cookies[cookieName];
                const authres = await root.post('sys:user,auth:user', { token });
                if (authres.ok) {
                    extendPrincipal(custom, 'user', authres.user);
                    extendPrincipal(custom, 'login', authres.login);
                }
            }
        });
    }
    if (spec.user.require) {
        seneca.act('sys:gateway,add:hook,hook:action', {
            gateway: 'express',
            tag: seneca.plugin.tag,
            action: async function expressCookieAuth(_msg, ctx) {
                var _a, _b, _c;
                let seneca = this;
                // TODO: getPrincipal
                let user = (_c = (_b = (_a = seneca === null || seneca === void 0 ? void 0 : seneca.fixedmeta) === null || _a === void 0 ? void 0 : _a.custom) === null || _b === void 0 ? void 0 : _b.principal) === null || _c === void 0 ? void 0 : _c.user;
                if (null == user) {
                    ctx.res.sendStatus(401);
                    return { ok: false, why: 'no-user', handler$: { done: true } };
                }
            }
        });
    }
}
async function prepare_lambda_cookie(spec, _options) {
    const seneca = this;
    const root = seneca.root;
    const cookieName = spec.token.name;
    if (spec.user.auth) {
        seneca.act('sys:gateway,add:hook,hook:custom', {
            gateway: 'lambda',
            tag: seneca.plugin.tag,
            action: async function lambdaCookieUser(custom, _json, ctx) {
                // TODO: abstract cookie read as an option-defined function
                var _a;
                const headers = (_a = ctx === null || ctx === void 0 ? void 0 : ctx.event) === null || _a === void 0 ? void 0 : _a.headers;
                const cookieStr = headers ? (headers.Cookie || headers.cookie) : null;
                console.log('AUTH cookieStr', cookieStr); //, ctx.event.headers)
                if (null != cookieStr && 0 < cookieStr.length) {
                    const cookies = cookie_1.default.parse(cookieStr);
                    console.log('AUTH cookies', cookies);
                    const token = cookies[cookieName];
                    console.log('AUTH token', token);
                    const authres = await root.post('sys:user,auth:user', { token });
                    console.log('AUTH authres', authres);
                    if (authres.ok) {
                        extendPrincipal(custom, 'user', authres.user);
                        extendPrincipal(custom, 'login', authres.login);
                    }
                }
            }
        });
    }
    if (spec.user.require) {
        seneca.act('sys:gateway,add:hook,hook:action', {
            gateway: 'lambda',
            tag: seneca.plugin.tag,
            action: async function lambdaCookieAuth(_msg, _ctx) {
                var _a, _b, _c;
                let seneca = this;
                // TODO: getPrincipal
                let user = (_c = (_b = (_a = seneca === null || seneca === void 0 ? void 0 : seneca.fixedmeta) === null || _a === void 0 ? void 0 : _a.custom) === null || _b === void 0 ? void 0 : _b.principal) === null || _c === void 0 ? void 0 : _c.user;
                if (null == user) {
                    // Because this hook action returns a message result,
                    // processing is halted and no seneca action is called.
                    return { ok: false, why: 'no-user', gateway$: { status: 401 } };
                }
            }
        });
    }
}
async function prepare_lambda_cognito(spec, _options) {
    const seneca = this;
    if (spec.user.auth) {
        seneca.act('sys:gateway,add:hook,hook:custom', {
            gateway: 'lambda',
            tag: seneca.plugin.tag,
            action: async function lambdaCognitoUser(custom, _json, ctx) {
                var _a, _b, _c;
                const user = (_c = (_b = (_a = ctx.event) === null || _a === void 0 ? void 0 : _a.requestContext) === null || _b === void 0 ? void 0 : _b.authorizer) === null || _c === void 0 ? void 0 : _c.claims;
                if (user) {
                    extendPrincipal(custom, 'user', user);
                }
            }
        });
    }
    if (spec.user.require) {
        seneca.act('sys:gateway,add:hook,hook:action', {
            gateway: 'lambda',
            tag: seneca.plugin.tag,
            action: async function lambdaCognitoAuth(_msg, _ctx) {
                var _a, _b, _c;
                let seneca = this;
                // TODO: getPrincipal
                let user = (_c = (_b = (_a = seneca === null || seneca === void 0 ? void 0 : seneca.fixedmeta) === null || _a === void 0 ? void 0 : _a.custom) === null || _b === void 0 ? void 0 : _b.principal) === null || _c === void 0 ? void 0 : _c.user;
                if (null == user) {
                    // Because this hook action returns a message result,
                    // processing is halted and no seneca action is called.
                    // TODO: set 401 status code
                    return { ok: false, why: 'no-auth' };
                }
            }
        });
    }
}
function extendPrincipal(custom, key, val) {
    const principal = (custom.principal = (custom.principal || {}));
    principal[key] = val;
    return principal;
}
// Default options.
gateway_auth.defaults = {
    spec: {
        // https://expressjs.com/
        // requires:
        // - https://www.npmjs.com/package/cookie-parser
        express_cookie: (0, gubu_1.Skip)({
            active: false,
            token: {
                name: 'seneca-auth'
            },
            user: {
                auth: true,
                require: true,
            }
        }),
        lambda_cookie: (0, gubu_1.Skip)({
            active: false,
            token: {
                name: 'seneca-auth'
            },
            user: {
                auth: true,
                require: true,
            }
        }),
        lambda_cognito: (0, gubu_1.Skip)({
            active: false,
            user: {
                auth: true,
                require: true,
            }
        }),
    },
    // When true, errors will include stack trace.
    debug: false
};
exports.default = gateway_auth;
if ('undefined' !== typeof (module)) {
    module.exports = gateway_auth;
}
//# sourceMappingURL=gateway-auth.js.map