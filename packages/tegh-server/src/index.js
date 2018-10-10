import Promise from 'bluebird'

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import untildify from 'untildify'
import mkdirp from 'mkdirp'
import keypair from 'keypair'

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

const teghDaemon = async (argv, pluginLoader) => {
  if (argv[2] == null) {
    const expectedUseage = 'Expected useage: tegh [/path/to/config.yml]'
    throw new Error(`No config file provided. ${expectedUseage}`)
  }
  const configPath = path.resolve(argv[2])
  const config = loadConfigForm(configPath)

  const serverSettings = config.server
  delete config.server

  // wrapInCrashReporting({ configPath, config }, ({
  //   setErrorHandlerStore,
  // }) => {

  const store = createTeghStore()

  const action = initializeConfig({
    config,
    pluginLoader,
  })

  store.dispatch(action)

  // setErrorHandlerStore(store)

  // TODO: make server plugin config dynamic and based on the store.
  const teghServerConfig = {
    schema: teghSchema,
    context: {
      store,
    },
    keys: untildify(serverSettings.keys),
    signallingServer: serverSettings.signallingServer,
  }

  const newKeys = JSON.stringify(keypair())
  try {
    mkdirp.sync(path.dirname(teghServerConfig.keys))
    fs.writeFileSync(teghServerConfig.keys, newKeys, { flag: 'wx' })
  } catch (e) {
    // eslint-disable-next-line no-empty-block
  }

  if (serverSettings.webRTC) {
    webRTCServer(teghServerConfig)
  }
  if (serverSettings.tcpPort) {
    httpServer(teghServerConfig, serverSettings.tcpPort)
  }
  if (serverSettings.unixSocket) {
    httpServer(teghServerConfig, serverSettings.unixSocket)
  }
}

export default teghDaemon
