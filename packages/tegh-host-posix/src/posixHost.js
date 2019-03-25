import Promise from 'bluebird'
import os from 'os'
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import keypair from 'keypair'
import { createECDHKey } from 'graphql-things'

import * as teghAutodrop3D from '@tegh/autodrop3d'
import * as teghCore from '@tegh/core'
import * as teghDriverSerialGCode from '@tegh/driver-serial-gcode'
import * as teghMacrosDefault from '@tegh/macros-default'
import * as teghRaspberryPi from '@tegh/raspberry-pi'

// import { wrapInCrashReporting } from './crashReport'
import httpServer from './server/httpServer'
import webRTCServer from './server/webRTCServer'

const plugins = {
  '@tegh/autodrop3d': teghAutodrop3D,
  '@tegh/core': teghCore,
  '@tegh/driver-serial-gcode': teghDriverSerialGCode,
  '@tegh/macros-default': teghMacrosDefault,
  '@tegh/raspberry-pi': teghRaspberryPi,
}

const {
  initializeConfig,
  executableSchema,
  createTeghHostStore,
  authenticate,
} = teghCore

global.Promise = Promise

// Get document, or throw exception on error
const loadConfigForm = async (configPath) => {
  if (!fs.existsSync(configPath)) {
    // const devPath = path.join(__dirname, '../../../development.config')
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const devConfig = require('../development.config')
    if (devConfig.auth.hostIdentityKeys == null) {
      devConfig.auth.hostIdentityKeys = await createECDHKey()
    }
    mkdirp.sync(path.dirname(configPath))
    fs.writeFileSync(configPath, JSON.stringify(devConfig, null, 2))
  }
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return JSON.parse(fs.readFileSync(configPath))
  } catch (e) {
    throw new Error(`Unable to load config file ${configPath}\n${e.message}`, e)
  }
}

const teghServer = async (argv, pluginLoader) => {
  if (argv[3] === '--help') {
    const expectedUseage = 'Tegh server. Useage: tegh [CONFIG_FILE]'
    // eslint-disable-next-line no-console
    console.error(expectedUseage)
    return
  }
  const configPath = path.resolve(
    argv[3]
    || path.join(os.homedir(), '.tegh/config.json'),
  )
  const config = await loadConfigForm(configPath)

  const serverSettings = config.host.server
  delete config.server

  // wrapInCrashReporting({ configPath, config }, ({
  //   setErrorHandlerStore,
  // }) => {

  const store = createTeghHostStore()

  const action = initializeConfig({
    config,
    pluginLoader,
  })

  store.dispatch(action)
  // setErrorHandlerStore(store)

  // TODO: make server plugin config dynamic and based on the store.
  const teghServerConfig = {
    schema: executableSchema(),
    context: {
      store,
    },
    identityKeys: config.auth.hostIdentityKeys,
    authenticate: ({ peerIdentityPublicKey }) => (
      authenticate({ peerIdentityPublicKey, store })
    ),
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

const nodeModulesPluginLoader = async (pluginName) => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const pluginModule = plugins[pluginName]
  if (pluginModule == null) {
    throw new Error(`Plugin not found: ${pluginName}`)
  }
  return pluginModule
}

process.on('unhandledRejection', (e) => { throw e })

teghServer(process.argv, nodeModulesPluginLoader)
