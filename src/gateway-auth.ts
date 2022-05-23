/* Copyright © 2021-2022 Richard Rodger, MIT License. */


import { Open } from 'gubu'


function gateway_auth(this: any, options: any) {
  const seneca: any = this


  this.prepare(async function(this: any) {
    for (let gateway in options.gateways) {
      if (options.gateway[gateway].active) {
        await prepareGateway[gateway].call(this, options.gateway[gateway], options)
      }
    }
  })


  return {
    exports: {
    }
  }
}


const prepareGateway: any = {
  express: prepareExpress,
}


async function prepareExpress(this: any, spec: any, options: any) {
  const seneca = this
  const root = seneca.root
  const cookieName = spec.token.name

  if (spec.user.auth) {
    seneca.act('sys:gateway,add:hook,hook:custom', {
      gateway: 'express',
      action: async (custom: any, _json: any, ctx: any) => {
        // TODO: abstract cookie read as an option-defined function
        const token = ctx.req.cookies[cookieName]

        let authres = await root.post('sys:user,auth:user', { token })
        if (authres.ok) {
          extendPrincipal(custom, 'user', authres.user)
        }
      }
    })
  }

  if (spec.user.require) {
    seneca.act('sys:gateway,add:hook,hook:action', {
      action: async function(this: any, _msg: any, ctx: any) {
        let seneca: any = this
        // TODO: getPrincipal
        let user = seneca?.fixedmeta?.custom?.principal?.user
        if (null == user) {
          ctx.res.sendStatus(401)
          return { ok: false, why: 'no-user' }
        }
      }
    })
  }
}


function extendPrincipal(custom: any, key: string, val: any) {
  const principal = (custom.principal = (custom.principal || {}))
  principal[key] = val
  return principal
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
}


export default gateway_auth

if ('undefined' !== typeof (module)) {
  module.exports = gateway_auth
}
