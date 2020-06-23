// import Promise from 'bluebird'
import os from 'os'
// import fs from 'fs'
// import childProcess from 'child_process'
import path from 'path'
import mkdirp from 'mkdirp'
import keypair from 'keypair'
import { createECDHKey } from 'graphql-things'
import writeFileAtomic from 'write-file-atomic'
// import npid from 'npid'

// import * as tegAutodrop3D from '@tegapp/autodrop3d'
import * as tegCore from '@tegapp/core'
import * as tegMarlin from '@tegapp/marlin'
import * as tegMacrosDefault from '@tegapp/macros-default'
// import * as tegRaspberryPi from '@tegapp/raspberry-pi'

import {
  handleFatalExceptions,
  getPreviousFatalException,
} from './FatalExceptionManager'
// import httpServer from './server/httpServer'
import webRTCServer from './server/webRTCServer'

import packageJSON from '../package.json'
// import Config from '@tegapp/core/dist/config/types/Config'

// var exec = require('child_process').exec
// exec("id", function(err, stdout, stderr) {
//   console.log(`ID!!!`, stdout);
// });
// exec("groups", function(err, stdout, stderr) {
//   console.log(`GROUPS!!!!!`, stdout);
// });

const availablePlugins = {
  // '@tegapp/autodrop3d': tegAutodrop3D,
  '@tegapp/core': tegCore,
  '@tegapp/marlin': tegMarlin,
  '@tegapp/macros-default': tegMacrosDefault,
  // '@tegapp/raspberry-pi': tegRaspberryPi,
}

const {
  initializeConfig,
  executableSchema,
  createTegHostStore,
  authenticate,
  loadConfigOrSetDefault,
} = tegCore

// global.Promise = Promise

// This pid file is used to send USR2 signals to the process to indicate when an update to Teg 
// is available and ready to swap over to from this one.
const updatePidFile = async (pidArg) => {
  const pidDirectory = path.resolve(
    pidArg || (process.env.NODE_ENV === 'production' ? '/run' : os.homedir()),
  )
  const pidFile = path.join(pidDirectory, 'teg.pid')
  writeFileAtomic.sync(pidFile, `${process.pid}`)
}

const tegServer = async (argv, pluginLoader) => {
  // eslint-disable-next-line no-console
  console.error(`Teg v${packageJSON.version}`)

  const expectedUseage = 'Useage: teg [serve|create-config]'

  const [, , cmd, configArg, pidArg] = argv

  if (cmd === '--help') {
    // eslint-disable-next-line no-console
    console.error(expectedUseage)
    return
  }

  const allCmds = [
    'serve',
    'create-config',
  ]

  if (allCmds.includes(cmd) === false) {
    // eslint-disable-next-line no-console
    console.error(`Invalid command: ${cmd}`)
    // eslint-disable-next-line no-console
    console.error(expectedUseage)
    process.exitCode = 1
    return
  }

  const configDirectory = path.resolve(
    configArg
    || '/etc/teg',
  )

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const defaultConfig = require('../development.config')

  const config = await loadConfigOrSetDefault({
    configDirectory,
    defaultConfig,
    createECDHKey,
  })

  if (cmd === 'create-config') {
    // eslint-disable-next-line no-console
    console.error('create-config: Configuration ready.')
    return
  }

  await updatePidFile(pidArg)

  handleFatalExceptions({ config })
  const previousFatalException = getPreviousFatalException({ config })

  const store = createTegHostStore()

  const action = initializeConfig({
    config,
    pluginLoader,
    availablePlugins,
    previousFatalException,
    // updatesFile,
  })

  try {
    store.dispatch(action)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Store Initialization Error. Shutting down: ${e}`)
    process.exitCode = 1
    return
  }
  // setErrorHandlerStore(store)
  try {
    // TODO: make server plugin config dynamic and based on the store.
    const tegServerConfig = {
      schema: await executableSchema(),
      context: {
        store,
      },
      identityKeys: config.auth.hostIdentityKeys,
      authenticate: ({ peerIdentityPublicKey, authToken }) => (
        authenticate({ peerIdentityPublicKey, authToken, store })
      ),
    }

    const newKeys = JSON.stringify(keypair())

    try {
      mkdirp.sync(path.dirname(tegServerConfig.keys))
      writeFileAtomic.sync(tegServerConfig.keys, newKeys, { flag: 'wx' })
    } catch (e) {
      // eslint-disable-next-line no-empty-block
    }

    // console.error(serverSettings)
    // if (serverSettings.webRTC) {
    webRTCServer(tegServerConfig)
    // }
    // if (serverSettings.tcpPort) {
    //   httpServer(tegServerConfig, serverSettings.tcpPort)
    // }
    // if (serverSettings.unixSocket) {
    //   httpServer(tegServerConfig, serverSettings.unixSocket)
    // }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Server Initialization Error. Shutting down: ${e}`)
    process.exitCode = 1
    // hack: setting process.exitCode is not working for some reason
    setTimeout(() => process.exit(1), 200)
    throw e
  }
}

const nodeModulesPluginLoader = async (pluginName) => {
  // eslint-disable-next-line global-require, import/no-dynamic-require
  const pluginModule = availablePlugins[pluginName]
  if (pluginModule == null) {
    throw new Error(`Plugin not found: ${pluginName}`)
  }
  return pluginModule
}

process.on('unhandledRejection', (e) => { throw e })

tegServer(process.argv, nodeModulesPluginLoader)
