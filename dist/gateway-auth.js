"use strict";
/* Copyright © 2021-2022 Richard Rodger, MIT License. */
Object.defineProperty(exports, "__esModule", { value: true });
function gateway_auth(options) {
    const seneca = this;
    return {
        exports: {}
    };
}
// Default options.
gateway_auth.defaults = {
    // When true, errors will include stack trace.
    debug: false
};
exports.default = gateway_auth;
if ('undefined' !== typeof (module)) {
    module.exports = gateway_auth;
}
//# sourceMappingURL=gateway-auth.js.map