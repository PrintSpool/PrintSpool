import os from 'os'
import fs from 'fs'
import http from 'http'
import koa from 'koa'
import koaRouter from 'koa-router'
import koaBody from 'koa-bodyparser'
import cors from 'koa-cors'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import { apolloUploadKoa } from 'apollo-upload-server'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import _ from 'lodash'

const httpServer = ({
  schema,
  context,
}, port) => {
  const isTCP = typeof port === 'number'
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

  app.use(cors())
  app.use(router.routes())
  app.use(router.allowedMethods())
  // eslint-disable-next-line no-console
  if (!isTCP && fs.existsSync(port)) fs.unlinkSync(port)
  server.listen(port, () => {
    let portFullName = port
    if (isTCP) {
      const allIPs = _.flatten(Object.values(os.networkInterfaces()))
      const ipAddress = allIPs.filter(ip =>
        !ip.internal && ip.family === 'IPv4'
      )[0].address
      portFullName = `http://${ipAddress}:${port}`
    }
    console.error(`Tegh is listening on ${portFullName}`)
  })
}

export default httpServer
