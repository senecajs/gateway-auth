
import GatewayAuth from '../src/gateway-auth'

const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')
const GatewayAuthMessages = require('./gateway-auth.messages').default



describe('gateway-auth', () => {

  test('happy', async () => {
    const seneca = Seneca({ legacy: false }).test().use('promisify').use(GatewayAuth)
    await seneca.ready()
  })

  test('messages', async () => {
    const seneca = Seneca({ legacy: false }).test().use('promisify').use(GatewayAuth)
    await (SenecaMsgTest(seneca, GatewayAuthMessages)())
  })

})

