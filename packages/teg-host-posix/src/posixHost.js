// import Promise from 'bluebird'
import os from 'os'
import fs from 'fs'
import childProcess from 'child_process'
import path from 'path'
import mkdirp from 'mkdirp'
import keypair from 'keypair'
import { createECDHKey } from 'graphql-things'
import writeFileAtomic from 'write-file-atomic'
import npid from 'npid'

// import * as tegAutodrop3D from '@tegapp/autodrop3d'
import * as tegCore from '@tegapp/core'
import * as tegMarlin from '@tegapp/marlin'
import * as tegMacrosDefault from '@tegapp/macros-default'
// import * as tegRaspberryPi from '@tegapp/raspberry-pi'

import {
  handleFatalExceptions,
  getPreviousFatalException,
} from './FatalExceptionManager'
import httpServer from './server/httpServer'
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


const tegServer = async (argv, pluginLoader) => {
  // eslint-disable-next-line no-console
  console.error(`Teg v${packageJSON.version}`)

  const expectedUseage = 'Useage: teg [serve|create-config]'

  const [, , cmd, configArg] = argv

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

  const pidDirectory = path.resolve(
    configArg
    || '/var/lib/teg',
  )

  // const updatesFile = path.join(configDirectory, '.updates')

  // create the config directory if it doesn't exist
  if (!fs.existsSync(pidDirectory)) {
    mkdirp.sync(pidDirectory, {
      mode: 0o700,
    })
  }

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const defaultConfig = require('../development.config')

  const config = await loadConfigOrSetDefault({
    configDirectory,
    defaultConfig,
    createECDHKey,
  })

  if (cmd === 'create-config') {
    console.error('create-config: Configuration ready.')
    return
  }

  // touch the updates file
  // fs.closeSync(fs.openSync(updatesFile, 'a'))

  // const writePIDFile = (json) => {
  //   writeFileAtomic.sync(updatesFile, JSON.stringify(json, null, 2))
  // }

  const pidFile = path.join(pidDirectory, 'teg.pid')

  const createPidFile = () => {
    try {
      const pid = npid.create(pidFile)
      pid.removeOnExit()

      return { pidCreated: true }
    } catch (err) {
      if (!fs.existsSync(pidFile)) {
        throw err
      }
      const pid = parseInt(fs.readFileSync(pidFile, 'utf8').trim(), 10)
      const isRunning = childProcess.spawnSync('ps', ['-p', pid]).status === 0

      if (isRunning) {
        // eslint-disable-next-line no-console
        console.error(
          `Another copy of Teg is running (pid: ${pid}). Shutting down.`,
        )
        return { pidCreated: false }
      }

      /*
       * if the pid file exists but there is no process with that pid running
       * then delete the pid file and retry
       */
      fs.unlinkSync(pidFile)
      return createPidFile()
    }
  }

  if (createPidFile().pidCreated === false) {
    process.exitCode = 1
    return
  }
  //
  // const updatesText = fs.readFileSync(updatesFile, 'utf8')
  //
  // const updates = updatesText !== '' ? JSON.parse(updatesText) : {
  //   hasPendingUpdates: false,
  //   readyToUpdate: false,
  // }
  //
  // if (updates.hasPendingUpdates) {
  //   // eslint-disable-next-line no-console
  //   console.error('Teg updates in progress. Will retry in 10 seconds...')
  //
  //   setTimeout(() => {
  //     // eslint-disable-next-line no-console
  //     console.error('Restarting Teg')
  //   }, 10 * 1000)
  //
  //   return
  // }

  handleFatalExceptions({ config })
  const previousFatalException = getPreviousFatalException({ config })

  const serverSettings = config.host.server
  delete config.server

  const store = createTegHostStore()

  const action = initializeConfig({
    config,
    pluginLoader,
    availablePlugins,
    previousFatalException,
    // updatesFile,
  })

  store.dispatch(action)
  // setErrorHandlerStore(store)

  // TODO: make server plugin config dynamic and based on the store.
  const tegServerConfig = {
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
    mkdirp.sync(path.dirname(tegServerConfig.keys))
    writeFileAtomic.sync(tegServerConfig.keys, newKeys, { flag: 'wx' })
  } catch (e) {
    // eslint-disable-next-line no-empty-block
  }

  if (serverSettings.webRTC) {
    webRTCServer(tegServerConfig)
  }
  if (serverSettings.tcpPort) {
    httpServer(tegServerConfig, serverSettings.tcpPort)
  }
  if (serverSettings.unixSocket) {
    httpServer(tegServerConfig, serverSettings.unixSocket)
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
