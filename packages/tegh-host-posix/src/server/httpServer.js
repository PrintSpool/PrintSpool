import os from 'os'
import fs from 'fs'
import http from 'http'
import koa from 'koa'
import koaRouter from 'koa-router'
import koaBody from 'koa-bodyparser'
import cors from 'koa-cors'
import { ApolloServer } from 'apollo-server-koa'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import { List } from 'immutable'
import Promise from 'bluebird'

const httpServer = async ({
  schema,
  context,
}, port) => {
  const isTCP = typeof port === 'number'
  // eslint-disable-next-line new-cap
  const koaApp = new koa()
  const server = http.createServer(koaApp.callback())
  // eslint-disable-next-line new-cap
  const router = new koaRouter()

  const teghGraphqlKoa = new ApolloServer({
    context,
    schema,
    debug: true,
    tracing: true,
  })

  teghGraphqlKoa.applyMiddleware({ app: koaApp })

  // router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))

  // Websocket
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
      })
      ,
    },
    {
      server,
      path: '/graphql',
    },
  )

  // for (const plugin of plugins) {
  //   const { serverHook } = plugin.fns
  //   if (serverHook != null) {
  //     const pluginPromise = serverHook({
  //       plugin,
  //       server,
  //       koaApp,
  //       koaRouter: router,
  //     })
  //     if (pluginPromise != null && pluginPromise.then != null) {
  //       await pluginPromise
  //     }
  //   }
  // }

  koaApp.use(cors())
  koaApp.use(router.routes())
  koaApp.use(router.allowedMethods())

  // eslint-disable-next-line no-console
  if (!isTCP && fs.existsSync(port)) fs.unlinkSync(port)

  // start the server
  const serverStartupPromise = new Promise((resolve, reject) => {
    const cb = error => (error ? reject(error) : resolve())
    server.listen(port, cb)
  })
  await serverStartupPromise

  let portFullName = port
  if (isTCP) {
    const allIPs = List(Object.values(os.networkInterfaces())).flatten().toJS()
    const ipv4IPs = allIPs.filter(ip => !ip.internal && ip.family === 'IPv4')
    const ipAddress = ipv4IPs.length > 0 ? ipv4IPs[0].address : 'localhost'
    portFullName = `http://${ipAddress}:${port}`
  }
  // eslint-disable-next-line no-console
  console.error(
    `Tegh is listening on ${portFullName}`,
  )
}

export default httpServer
