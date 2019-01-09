import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import EventEmitter from 'eventemitter3'

import wrapInSocketAPI, { SOCKET_STATES } from '../connection/wrapInSocketAPI'

const createSubscriptionServer = ({
  context = {},
  ...opts
} = {}) => {
  const teghSocketServer = new EventEmitter()
  Object.assign(teghSocketServer, SOCKET_STATES)

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
    teghSocketServer,
  )

  return teghSocketServer
}

export const addSocket = async ({
  teghSocketServer,
  ...params
}) => {
  const socket = await wrapInSocketAPI(params)

  teghSocketServer.emit('connection', socket)
}

export default createSubscriptionServer
