import Dat from '@beaker/dat-node'
import wrtc from 'wrtc'

import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'

import { GraphQLThing } from 'graphql-things'

const webRTCServer = async ({
  schema,
  context,
  identityKeys,
  authenticate,
}) => {
  // const keysJSON = JSON.parse(
  //   fs.readFileSync(untildify(keys), 'utf8'),
  // )
  // instantiate the dat node
  const DAT_URL = 'dat://0588d04a52162b001c489a68182daac3de41a18487f88e8a93b6a69fbd38b1ed/'
  const dat = Dat.createNode({
    path: './.dat-data',
  })
  const datPeers = dat.getPeers(DAT_URL)

  const thing = GraphQLThing({
    datPeers,
    identityKeys,
    authenticate,
    wrtc,
  })

  const options = {
    execute,
    subscribe,
    schema,
    // the onOperation function is called for every new operation
    // and we use it to inject context to track the session and
    // user
    onOperation: async (msg, params, socket) => ({
      ...params,
      context: {
        ...context,
        sessionID: socket.sessionID,
        peerIdentityPublicKey: socket.peerIdentityPublicKey,
      },
    }),
  }

  SubscriptionServer.create(options, thing)
}

export default webRTCServer
