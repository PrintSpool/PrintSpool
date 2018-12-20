import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import EventEmitter from 'eventemitter3'

import createWebRTCSocket, { SOCKET_STATES } from '../webRTC/createWebRTCSocket'

const createSubscriptionServer = ({
  context = {},
  ...opts
} = {}) => {
  const webRTCSocketServer = new EventEmitter()
  Object.assign(webRTCSocketServer, SOCKET_STATES)

  SubscriptionServer.create(
    {
      execute,
      subscribe,
      // the onOperation function is called for every new operation
      // and we use it to set the GraphQL context for this operation and
      // inject context.sessionID to track the session
      onOperation: async (msg, params, socket) => ({
        ...params,
        context: {
          sessionID: socket.sessionID,
          ...context,
        },
      }),
      ...opts,
    },
    webRTCSocketServer,
  )

  return webRTCSocketServer
}

export const addSocket = async ({
  webRTCSocketServer,
  ...opts
}) => {
  const { finalizeSocket } = await createWebRTCSocket(opts)
  const socket = await finalizeSocket()

  webRTCSocketServer.emit('connection', socket)
}

export default createSubscriptionServer
