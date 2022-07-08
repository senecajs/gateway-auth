"use strict";
/* Copyright © 2021-2022 Richard Rodger, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
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
    stytch: prepare_stytch,
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
                // TODO: abstract cookie read as an option-defined function
                const token = ctx.req.cookies[cookieName];
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
// NOTE: does *not* use stytch session management
async function prepare_stytch(spec, _options) {
    const seneca = this;
    const root = seneca.root;
    const cookieName = spec.token.name;
    if (spec.user.auth) {
        seneca.act('sys:gateway,add:hook,hook:custom', {
            gateway: 'stytch',
            tag: seneca.plugin.tag,
            action: async function stytchUser(custom, _json, ctx) {
                // TODO: abstract cookie read as an option - defined function
                const token = ctx.req.cookies[cookieName];
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
            gateway: 'stytch',
            tag: seneca.plugin.tag,
            action: async function stytchCookieAuth(_msg, ctx) {
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
        // https://github.com/senecajs/seneca-stytch-provider
        stytch: (0, gubu_1.Skip)({
            active: false,
            token: {
                name: 'stytch-auth'
            },
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