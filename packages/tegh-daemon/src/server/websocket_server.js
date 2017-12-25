import { createServer } from 'http'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'

const websocketServer = ({schema, context}) => {
  const WS_PORT = 5000

  // Create WebSocket listener server
  const server = createServer((request, response) => {
    response.writeHead(404)
    response.end()
  })

  // Bind it to port and start listening
  server.listen(WS_PORT, () => console.log(
    `Websocket Server is now running on http://localhost:${WS_PORT}`
  ))

  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      // the onOperation function is called for every new operation
      // and we use it to set the GraphQL context for this operation
      onOperation: async (msg, params, socket) => {
        // console.log('operation', msg)
        return {
          ...params,
          context,
        }
      },
    },
    {
      server,
      path: '/graphql',
    },
  )
}

export default websocketServer
