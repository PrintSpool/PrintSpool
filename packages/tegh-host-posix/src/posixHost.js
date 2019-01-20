import Promise from 'bluebird'
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import keypair from 'keypair'

import {
  initializeConfig,
  executableSchema,
  createTeghHostStore,
  authenticate,
} from 'tegh-core'

// import { wrapInCrashReporting } from './crashReport'
import httpServer from './server/httpServer'
import webRTCServer from './server/webRTCServer'

global.Promise = Promise

// Get document, or throw exception on error
const loadConfigForm = (configPath) => {
  if (!fs.existsSync(configPath)) {
    const devPath = path.join(__dirname, '../../../development.config')
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const devConfig = require(devPath)
    mkdirp(path.dirname(configPath))
    fs.writeFileSync(configPath, JSON.stringify(devConfig))
  }
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return JSON.parse(fs.readFileSync(configPath))
  } catch (e) {
    throw new Error(`Unable to load config file ${configPath}\n${e.message}`, e)
  }
}

const teghServer = async (argv, pluginLoader) => {
  if (argv[2] == null) {
    const expectedUseage = 'Expected useage: tegh [/path/to/config.js]'
    throw new Error(`No config file provided. ${expectedUseage}`)
  }
  const configPath = path.resolve(argv[2])
  const config = loadConfigForm(configPath)

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
    hostIdentityKeys: config.auth.hostIdentityKeys,
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

const nodeModulesPluginLoader = plugin => new Promise((resolve) => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  resolve(require(plugin))
})

process.on('unhandledRejection', (e) => { throw e })

teghServer(process.argv, nodeModulesPluginLoader)
