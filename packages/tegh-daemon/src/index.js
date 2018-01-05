import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'

import { wrapInCrashReporting } from './helpers/crash_report'
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
  const configPath = argv[2]
  if (configPath == null) {
    const expectedUseage = 'Expected useage: tegh [/path/to/config.yml]'
    throw new Error(`No config file provided. ${expectedUseage}`)
  }
  const config = loadConfig(configPath)

  wrapInCrashReporting({ configPath, config }, ({ crashReport }) => {
    const driver = loadPlugin(`tegh-driver-${config.driver.package}`)
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
