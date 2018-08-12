import os from 'os'
import fs from 'fs'
import http from 'http'
import koa from 'koa'
import koaRouter from 'koa-router'
import koaBody from 'koa-bodyparser'
import cors from 'koa-cors'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import { ApolloEngine } from 'apollo-engine'
import _ from 'lodash'
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

  const teghGraphqlKoa = () => graphqlKoa({
    context,
    schema,
    debug: true,
    tracing: true,
  })

  // koaBody is needed just for POST.
  router.post(
    '/graphql',
    koaBody(),
    teghGraphqlKoa(),
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
      onOperation: async (msg, params, socket) => ({
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

  for (const plugin of plugins) {
    const { serverHook } = plugin.fns
    if (serverHook != null) {
      const pluginPromise = serverHook({
        plugin,
        server,
        koaApp,
        koaRouter: router,
      })
      if (pluginPromise != null && pluginPromise.then != null) {
        await pluginPromise
      }
    }
  }

  koaApp.use(cors())
  koaApp.use(router.routes())
  koaApp.use(router.allowedMethods())

  // eslint-disable-next-line no-console
  if (!isTCP && fs.existsSync(port)) fs.unlinkSync(port)

  // start the server and adding Apollo Engine
  const enginePort = 3500
  const isEngineEnabled = process.env.ENGINE_API_KEY != null && isTCP
  const serverStartupPromise = new Promise((resolve, reject) => {
    const cb = error => (error ? reject(error) : resolve())
    if (isEngineEnabled) {
      // Initialize engine with your API key.
      // Set the ENGINE_API_KEY environment variable when you
      // run your program.
      const engine = new ApolloEngine()

      // Call engine.listen instead of app.listen(port)
      engine.listen({
        port,
        httpServer: server,
      }, cb)
    } else {
      server.listen(port, cb)
    }
  })
  await serverStartupPromise

  let portFullName = port
  const apolloEngineMsg = (
    `Apollo Engine is ${isEngineEnabled ? 'en' : 'dis'}abled`
  )
  if (isTCP) {
    const allIPs = _.flatten(Object.values(os.networkInterfaces()))
    const ipv4IPs = allIPs.filter(ip => !ip.internal && ip.family === 'IPv4')
    const ipAddress = ipv4IPs.length > 0 ? ipv4IPs[0].address : 'localhost'
    portFullName = `http://${ipAddress}:${port}`
  }
  console.error(
    `Tegh is listening on ${portFullName} (${apolloEngineMsg})`,
  )
}

export default httpServer
