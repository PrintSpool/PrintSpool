import http from 'http'
import koa from 'koa'
import koaRouter from 'koa-router'
import koaBody from 'koa-bodyparser'
import cors from 'koa-cors'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import { apolloUploadKoa } from 'apollo-upload-server'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'

const httpPostServer = ({
  config,
  schema,
  context,
}) => {
  // eslint-disable-next-line new-cap
  const app = new koa()
  const server = http.createServer(app.callback())
  // eslint-disable-next-line new-cap
  const router = new koaRouter()

  const teghGraphqlKoa = () => graphqlKoa({
    context,
    schema,
  })

  // koaBody is needed just for POST.
  router.post(
    '/graphql',
    koaBody(),
    apolloUploadKoa(),
    teghGraphqlKoa()
  )

  router.get('/graphql', teghGraphqlKoa())

  router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))

  // Websocket
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

  const port = config.server.port
  app.use(cors())
  app.use(router.routes())
  app.use(router.allowedMethods())
  // eslint-disable-next-line no-console
  server.listen(port, () => { console.log(`Tegh is listening on ${port}`) })
}

export default httpPostServer
