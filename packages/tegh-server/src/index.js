import Promise from 'bluebird'

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

import {
  initializeConfig,
  getAllPlugins,
  subscriptions as subscriptionModules,
} from 'tegh-core'

// import { wrapInCrashReporting } from './crashReport'
import teghSchema from './schema/schema'
import reduxPubSub from './reduxPubSub'
import createTeghStore from './createTeghStore'
import httpServer from './server/httpServer'

global.Promise = Promise

// Get document, or throw exception on error
export const loadConfigForm = (configPath) => {
  try {
    return yaml.safeLoad(fs.readFileSync(configPath, 'utf8'))
  } catch (e) {
    throw new Error(`Unable to load config file ${configPath}\n${e.message}`, e)
  }
}

const teghDaemon = async (argv, pluginLoaderPath) => {
  if (argv[2] == null) {
    const expectedUseage = 'Expected useage: tegh [/path/to/config.yml]'
    throw new Error(`No config file provided. ${expectedUseage}`)
  }
  const configPath = path.resolve(argv[2])
  const configForm = loadConfigForm(configPath)

  // wrapInCrashReporting({ configPath, config }, ({
  //   setErrorHandlerStore,
  // }) => {

  const action = initializeConfig({
    pluginLoaderPath,
    configForm,
  })

  const store = createTeghStore()
  await store.dispatch(action)

  // setErrorHandlerStore(store)
  const pubsub = reduxPubSub(store, subscriptionModules)

  const { config } = store.getState()
  const plugins = getAllPlugins(config)

  const teghServerConfig = {
    schema: teghSchema,
    context: {
      store,
      pubsub,
    },
    // TODO:  make server plugin config dynamic and based on the store.
    plugins,
  }

  if (config.server.tcpPort) {
    httpServer(teghServerConfig, config.server.tcpPort)
  }
  if (config.server.unixSocket) {
    httpServer(teghServerConfig, config.server.unixSocket)
  }
  // })
}

export default teghDaemon
