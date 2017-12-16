import koa from 'koa'
import koaRouter from 'koa-router'
import koaBody from 'koa-bodyparser'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'
import yaml from 'js-yaml'
import fs from 'fs'

import onUncaughtException from './helpers/on_uncaught_exception'
import teghSchema from './graphql/schema'
import store from './store'

const teghDaemon = (argv, loadPlugin) => {
  process.on('uncaughtException', onUncaughtException)

  // Get document, or throw exception on error
  const config = (() => {
    const expectedUseage = 'Expected useage: tegh [/path/to/config.yml]'
    const configPath = argv[2]
    if (configPath == null) {
      throw new Error(`No config file provided. ${expectedUseage}`)
    }
    try {
      return yaml.safeLoad(fs.readFileSync(configPath, 'utf8'))
    } catch (e) {
      throw new Error(`Unable to load config file. ${expectedUseage}`, e)
    }
  })()

  const driver = loadPlugin(`tegh-driver-${config.driver.package}`)

  // eslint-disable-next-line new-cap
  const app = new koa()
  // eslint-disable-next-line new-cap
  const router = new koaRouter()
  const PORT = 3000

  const teghGraphqlKoa = () => graphqlKoa({
    schema: teghSchema,
    context: {
      store: store({ config, driver }),
    },
  })

  // koaBody is needed just for POST.
  router.post('/graphql', koaBody(), teghGraphqlKoa())
  router.get('/graphql', teghGraphqlKoa())

  router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }))

  app.use(router.routes())
  app.use(router.allowedMethods())
  // eslint-disable-next-line no-console
  app.listen(PORT, () => { console.log(`Tegh is listening on ${PORT}`) })
}

export default teghDaemon
