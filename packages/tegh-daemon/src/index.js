import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import domain from 'domain'

import {
  loadCrashReport,
  onUncaughtException,
} from './helpers/crash_report'
import teghSchema from './graphql/schema'
import reduxPubSub from './graphql/redux_pub_sub'
import createTeghStore from './store'
import websocketServer from './server/websocket_server'
import httpPostServer from './server/http_post_server'

export { effects } from 'redux-saga'

// Get document, or throw exception on error
export const loadConfig = (configPath) => {
  try {
    return yaml.safeLoad(fs.readFileSync(path.resolve(configPath), 'utf8'))
  } catch (e) {
    throw new Error(`Unable to load config file ${configPath}`, e)
  }
}

const teghDaemon = (argv, loadPlugin) => {
  const teghDomain = domain.create()
  const configPath = argv[2]
  process.on('unhandledRejection', (e, p) => {
    throw e
  })
  const errorDir = path.join(path.dirname(configPath), 'log')
  if (!fs.existsSync(errorDir)) fs.mkdirSync(errorDir)
  teghDomain.on('error', onUncaughtException(errorDir))

  teghDomain.run(() => {
    const expectedUseage = 'Expected useage: tegh [/path/to/config.yml]'
    if (configPath == null) {
      throw new Error(`No config file provided. ${expectedUseage}`)
    }
    const config = loadConfig(configPath)
    const driver = loadPlugin(`tegh-driver-${config.driver.package}`)
    const crashReport = loadCrashReport(errorDir)
    const storeContext = { config, driver, crashReport }
    const store = createTeghStore(storeContext)
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
  })
}

export default teghDaemon
