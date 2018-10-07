import Promise from 'bluebird'

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

import {
  initializeConfig,
} from 'tegh-core'

// import { wrapInCrashReporting } from './crashReport'
import teghSchema from './schema/schema'
import createTeghStore from './createTeghStore'
import httpServer from './server/httpServer'
import webRTCServer from './server/webRTCServer'

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
    configForm,
    pluginLoaderPath,
  })

  const store = createTeghStore()
  await store.dispatch(action)

  // setErrorHandlerStore(store)

  console.log(store.getState())
  const { config } = store.getState()

  const teghServerConfig = {
    schema: teghSchema,
    context: {
      store,
    },
    keys: config.server.keys,
    signallingServer: config.server.signallingServer,
    // TODO:  make server plugin config dynamic and based on the store.
  }

  // if (config.server.webRTC) {
  //   webRTCServer(teghServerConfig)
  // }
  if (config.server.tcpPort) {
    httpServer(teghServerConfig, config.server.tcpPort)
  }
  if (config.server.unixSocket) {
    httpServer(teghServerConfig, config.server.unixSocket)
  }
  // })
}

export default teghDaemon
