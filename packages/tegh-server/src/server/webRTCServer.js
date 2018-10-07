import fs from 'fs'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import untildify from 'untildify'
import { TeghHost } from 'tegh-protocol'


const httpServer = async ({
  schema,
  context,
  keys,
  signallingServer,
}) => {
  // Websocket Server-compatible Tegh Protocol WebRTC host
  const teghHost = TeghHost({
    keys: fs.readFileSync(untildify(keys), 'utf8'),
    // TODO: authenticate users + implement access control
    authenticate: () => true,
    signallingServer,
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
  console.error('Tegh is listening for WebRTC connections')
}

export default httpServer
