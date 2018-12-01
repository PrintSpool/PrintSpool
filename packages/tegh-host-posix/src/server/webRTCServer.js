// import WebCrypto from 'node-webcrypto-ossl'
import crypto from '@trust/webcrypto'
import wrtc from 'wrtc'
import fs from 'fs'
import * as qrcode from 'qrcode-terminal'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import untildify from 'untildify'
import { TeghHost, setCrypto } from 'tegh-protocol'

// const webCrypto = new WebCrypto()
// setCrypto(webCrypto)
setCrypto(crypto)

const httpServer = async ({
  schema,
  context,
  keys,
  signallingServer,
}) => {
  const keysJSON = JSON.parse(
    fs.readFileSync(untildify(keys), 'utf8'),
  )
  // Websocket Server-compatible Tegh Protocol WebRTC host
  const teghHost = TeghHost({
    keys: keysJSON,
    // TODO: authenticate users + implement access control
    authenticate: () => true,
    signallingServer,
    wrtc,
  })

  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      // the onOperation function is called for every new operation
      // and we use it to set the GraphQL context for this operation
      onOperation: async (msg, params) => ({
        ...params,
        context,
      }),
    },
    teghHost,
  )

  // eslint-disable-next-line no-console
  console.error('\n\nTegh is listening for WebRTC connections. Connect to:\n')

  qrcode.generate(JSON.stringify({
    publicKey: keysJSON.public,
  }), {small: true}, function(qrcode) {
    console.log('\n' + qrcode)
  })

  console.error('\n\n')
}

export default httpServer
