"use strict";
/* Copyright © 2021-2022 Richard Rodger, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
function gateway_auth(options) {
    const seneca = this;
    this.prepare(async function () {
        for (let gateway in options.gateways) {
            if (options.gateway[gateway].active) {
                await prepareGateway[gateway].call(this, options.gateway[gateway], options);
            }
        }
    });
    return {
        exports: {}
    };
}
const prepareGateway = {
    express: prepareExpress,
};
async function prepareExpress(spec, options) {
    const seneca = this;
    const root = seneca.root;
    const cookieName = spec.token.name;
    if (spec.user.auth) {
        seneca.act('sys:gateway,add:hook,hook:custom', {
            gateway: 'express',
            action: async (custom, _json, ctx) => {
                // TODO: abstract cookie read as an option-defined function
                const token = ctx.req.cookies[cookieName];
                let authres = await root.post('sys:user,auth:user', { token });
                if (authres.ok) {
                    extendPrincipal(custom, 'user', authres.user);
                }
            }
        });
    }
    if (spec.user.require) {
        seneca.act('sys:gateway,add:hook,hook:action', {
            action: async function (_msg, ctx) {
                var _a, _b, _c;
                let seneca = this;
                // TODO: getPrincipal
                let user = (_c = (_b = (_a = seneca === null || seneca === void 0 ? void 0 : seneca.fixedmeta) === null || _a === void 0 ? void 0 : _a.custom) === null || _b === void 0 ? void 0 : _b.principal) === null || _c === void 0 ? void 0 : _c.user;
                if (null == user) {
                    ctx.res.sendStatus(401);
                    return { ok: false, why: 'no-user' };
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
    gateway: {
        // https://expressjs.com/
        // requires:
        // - https://www.npmjs.com/package/cookie-parser
        express: {
            active: false,
            token: {
                name: 'seneca-auth'
            },
            user: {
                auth: true,
                require: true,
            }
        },
    },
    // When true, errors will include stack trace.
    debug: false
};
exports.default = gateway_auth;
if ('undefined' !== typeof (module)) {
    module.exports = gateway_auth;
}
//# sourceMappingURL=gateway-auth.js.map