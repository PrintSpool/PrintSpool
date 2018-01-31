import Promise from 'bluebird'

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import _ from 'lodash'

import { wrapInCrashReporting } from './helpers/crash_report'
import teghSchema from './graphql/schema'
import reduxPubSub from './graphql/redux_pub_sub'
import createTeghStore from './store'
import httpServer from './server/http_server'

export * from './actions/'

global.Promise = Promise

// Get document, or throw exception on error
export const loadConfig = (configPath) => {
  try {
    return yaml.safeLoad(fs.readFileSync(configPath, 'utf8'))
  } catch (e) {
    throw new Error(`Unable to load config file ${configPath}`, e)
  }
}

const teghDaemon = (argv, loadPlugin) => {
  if (argv[2] == null) {
    const expectedUseage = 'Expected useage: tegh [/path/to/config.yml]'
    throw new Error(`No config file provided. ${expectedUseage}`)
  }
  const configPath = path.resolve(argv[2])
  const config = loadConfig(configPath)

  wrapInCrashReporting({ configPath, config }, ({
    crashReport,
    errorHandler,
    setErrorHandlerStore,
  }) => {
    const driver = loadPlugin(config.driver.package)
    const {errors, valid} = driver.validate(config)
    if (!valid) {
      console.error(errors.join('\n'))
      setImmediate(() => process.exit(1))
      return
    }
    const storeContext = {
      config,
      driver,
      crashReport,
      errorHandler,
      loadPlugin,
    }
    const store = createTeghStore(storeContext)
    setErrorHandlerStore(store)
    const pubsub = reduxPubSub(store)

    const teghServerConfig = {
      config,
      schema: teghSchema,
      context: {
        store: store,
        pubsub,
      },
    }

    if (config.server.tcpPort) {
      httpServer(teghServerConfig, config.server.tcpPort)
    }
    if (config.server.unixSocket) {
      httpServer(teghServerConfig, config.server.unixSocket)
    }
  })
}

export default teghDaemon
