import yaml from 'js-yaml'
import fs from 'fs'
import { resolve } from 'path'

import onUncaughtException from './helpers/on_uncaught_exception'
import teghSchema from './graphql/schema'
import reduxPubSub from './graphql/redux_pub_sub'
import createTeghStore from './store'
import websocketServer from './server/websocket_server'
import httpPostServer from './server/http_post_server'

export { effects } from 'redux-saga'

// Get document, or throw exception on error
export const loadConfig = (configPath) => {
  try {
    return yaml.safeLoad(fs.readFileSync(resolve(configPath), 'utf8'))
  } catch (e) {
    throw new Error(`Unable to load config file ${configPath}`, e)
  }
}

const teghDaemon = (argv, loadPlugin) => {
  process.on('uncaughtException', onUncaughtException)

  process.on('unhandledRejection', (e, p) => onUncaughtException(e))

  const configPath = argv[2]
  const expectedUseage = 'Expected useage: tegh [/path/to/config.yml]'
  if (configPath == null) {
    throw new Error(`No config file provided. ${expectedUseage}`)
  }
  const config = loadConfig(configPath)
  const driver = loadPlugin(`tegh-driver-${config.driver.package}`)
  const store = createTeghStore({ config, driver })
  const pubsub = reduxPubSub(store)

  const teghServerConfig = {
    schema: teghSchema,
    context: {
      store: store,
      pubsub,
    },
  }

  websocketServer(teghServerConfig)
  httpPostServer(teghServerConfig)
}

export default teghDaemon
