/* Copyright © 2021-2022 Richard Rodger, MIT License. */


import { Skip } from 'gubu'


function gateway_auth(this: any, options: any) {
  const seneca: any = this


  this.prepare(async function(this: any) {
    for (let spec in options.spec) {
      if (options.spec[spec].active) {
        await prepareSpec[spec]
          .call(this, options.spec[spec], options)
      }
    }
  })


  return {
    exports: {
    }
  }
}


const prepareSpec: any = {
  express_cookie: prepare_express_cookie,
}


async function prepare_express_cookie(this: any, spec: any, _options: any) {
  const seneca = this
  const root = seneca.root
  const cookieName = spec.token.name

  if (spec.user.auth) {
    seneca.act('sys:gateway,add:hook,hook:custom', {
      gateway: 'express',
      tag: seneca.plugin.tag,
      action: async function expressCookieUser(custom: any, _json: any, ctx: any) {
        // TODO: abstract cookie read as an option-defined function
        const token = ctx.req.cookies[cookieName]
        const authres = await root.post('sys:user,auth:user', { token })

        if (authres.ok) {
          extendPrincipal(custom, 'user', authres.user)
        }
      }
    })
  }

  if (spec.user.require) {
    seneca.act('sys:gateway,add:hook,hook:action', {
      gateway: 'express',
      tag: seneca.plugin.tag,
      action: async function expressCookieAuth(this: any, _msg: any, ctx: any) {
        let seneca: any = this
        // TODO: getPrincipal
        let user = seneca?.fixedmeta?.custom?.principal?.user
        if (null == user) {
          ctx.res.sendStatus(401)
          return { ok: false, why: 'no-user', handler$: { done: true } }
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

  spec: {

    // https://expressjs.com/
    // requires:
    // - https://www.npmjs.com/package/cookie-parser
    express_cookie: Skip({
      active: true,
      token: {
        name: 'seneca-auth'
      },
      user: {
        auth: true,
        require: true,
      }
    }),

  },


  // When true, errors will include stack trace.
  debug: false
}


export default gateway_auth

if ('undefined' !== typeof (module)) {
  module.exports = gateway_auth
}
