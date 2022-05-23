/* Copyright © 2021-2022 Richard Rodger, MIT License. */


import { Open } from 'gubu'


function gateway_auth(this: any, options: any) {
  const seneca: any = this


  return {
    exports: {
    }
  }
}


// Default options.
gateway_auth.defaults = {

  // When true, errors will include stack trace.
  debug: false
}


export default gateway_auth

if ('undefined' !== typeof (module)) {
  module.exports = gateway_auth
}
