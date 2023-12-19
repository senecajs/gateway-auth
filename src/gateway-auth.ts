/* Copyright © 2021-2022 Richard Rodger, MIT License. */


import Cookie from 'cookie'


import { Skip } from 'gubu'


function gateway_auth(this: any, options: any) {
  const seneca: any = this


  this.prepare(async function(this: any) {
    for (let specname in options.spec) {
      if (options.spec[specname].active) {
        let spec = prepareSpec[specname]
        if (!spec) {
          seneca.fail('unknown-auth-spec', specname)
        }
        await spec.call(this, options.spec[specname], options)
      }
    }

    await this.post('sys:repl,add:cmd,default$:{}', {
      name: 'gateway-user',
      action: async function(spec: any) {
        const delegateSpec = { ...spec }

        let args = spec.context.seneca.util.Jsonic(spec.argstr) || []
        args = Array.isArray(args) ? args : [args]

        const userref = args[0]

        if (null == userref) {
          return spec.respond('ERROR: user reference missing')
        }

        let delegateName = 'gateway-user-' + userref
        if (spec.context.delegate[delegateName]) {
          return spec.context.cmdMap.delegate({
            ...delegateSpec,
            argstr: delegateName,
          })
        }

        let userEnt = spec.context.seneca.root.entity('sys/user')
        let user = await userEnt.load$(userref)
        if (null == user) {
          user = await userEnt.load$({ email: userref })
        }
        if (null == user) {
          user = await userEnt.load$({ handle: userref })
        }

        if (null == user) {
          return spec.respond('ERROR: user not found: ' + userref)
        }

        delegateSpec.argstr = delegateName + ' root$ {} ' +
          JSON.stringify({
            custom: {
              principal: {
                user
              }
            }
          })

        return spec.context.cmdMap.delegate(delegateSpec)
      }
    })
  })


  return {
    exports: {
    }
  }
}


const prepareSpec: any = {
  express_cookie: prepare_express_cookie,
  lambda_cookie: prepare_lambda_cookie,
  lambda_cognito: prepare_lambda_cognito,
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
        const token = ctx?.req?.cookies[cookieName]
        const authres = await root.post('sys:user,auth:user', { token })

        if (authres.ok) {
          extendPrincipal(custom, 'user', authres.user)
          extendPrincipal(custom, 'login', authres.login)
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


async function prepare_lambda_cookie(this: any, spec: any, _options: any) {
  const seneca = this
  const root = seneca.root
  const cookieName = spec.token.name

  if (spec.user.auth) {
    seneca.act('sys:gateway,add:hook,hook:custom', {
      gateway: 'lambda',
      tag: seneca.plugin.tag,
      action: async function lambdaCookieUser(custom: any, _json: any, ctx: any) {
        // TODO: abstract cookie read as an option-defined function

        const headers = ctx?.event?.headers
        const cookieStr = headers ? (
          headers.Cookie || headers.cookie
        ) : null


        // console.log('AUTH cookieStr', cookieStr) //, ctx.event.headers)

        if (null != cookieStr && 0 < cookieStr.length) {
          const cookies = Cookie.parse(cookieStr)
          // console.log('AUTH cookies', cookies)

          const token = cookies[cookieName]
          // console.log('AUTH token', token)

          const authres = await root.post('sys:user,auth:user', { token })
          // console.log('AUTH authres', authres)

          if (authres.ok) {
            extendPrincipal(custom, 'user', authres.user)
            extendPrincipal(custom, 'login', authres.login)
          }
        }
      }
    })
  }

  if (spec.user.require) {
    seneca.act('sys:gateway,add:hook,hook:action', {
      gateway: 'lambda',
      tag: seneca.plugin.tag,
      action: async function lambdaCookieAuth(this: any, _msg: any, _ctx: any) {
        let seneca: any = this
        // TODO: getPrincipal
        let user = seneca?.fixedmeta?.custom?.principal?.user
        if (null == user) {
          // Because this hook action returns a message result,
          // processing is halted and no seneca action is called.
          return { ok: false, why: 'no-user', gateway$: { status: 401 } }
        }
      }
    })
  }
}


async function prepare_lambda_cognito(this: any, spec: any, _options: any) {
  const seneca = this

  if (spec.user.auth) {
    seneca.act('sys:gateway,add:hook,hook:custom', {
      gateway: 'lambda',
      tag: seneca.plugin.tag,
      action: async function lambdaCognitoUser(custom: any, _json: any, ctx: any) {
        const user = ctx.event?.requestContext?.authorizer?.claims
        if (user) {
          extendPrincipal(custom, 'user', user)
        }
      }
    })
  }

  if (spec.user.require) {
    seneca.act('sys:gateway,add:hook,hook:action', {
      gateway: 'lambda',
      tag: seneca.plugin.tag,
      action: async function lambdaCognitoAuth(this: any, _msg: any, _ctx: any) {
        let seneca: any = this
        // TODO: getPrincipal
        let user = seneca?.fixedmeta?.custom?.principal?.user
        if (null == user) {
          // Because this hook action returns a message result,
          // processing is halted and no seneca action is called.

          // TODO: set 401 status code
          return { ok: false, why: 'no-auth' }
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
      active: false,
      token: {
        name: 'seneca-auth'
      },
      user: {
        auth: true,
        require: true,
      }
    }),

    lambda_cookie: Skip({
      active: false,
      token: {
        name: 'seneca-auth'
      },
      user: {
        auth: true,
        require: true,
      }
    }),

    lambda_cognito: Skip({
      active: false,
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
