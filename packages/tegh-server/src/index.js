import Promise from 'bluebird'

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import _ from 'lodash'

import { wrapInCrashReporting } from './crashReport'
import teghSchema from './graphql/schema'
import reduxPubSub from './graphql/reduxPubSub'
import createTeghStore from './createTeghStore'
import httpServer from './server/httpServer'

export * from './core/actions'
export * from './core/types'

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
    const plugins = config.plugins.map((pluginConfig, index) => ({
      fns: loadPlugin(pluginConfig.package),
      config: pluginConfig,
      index,
    }))
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
      schema: teghSchema,
      context: {
        store,
        pubsub,
      },
      plugins,
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
