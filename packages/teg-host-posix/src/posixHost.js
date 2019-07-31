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

import * as tegAutodrop3D from '@tegapp/autodrop3d'
import * as tegCore from '@tegapp/core'
import * as tegDriverSerialGCode from '@tegapp/driver-serial-gcode'
import * as tegMacrosDefault from '@tegapp/macros-default'
import * as tegRaspberryPi from '@tegapp/raspberry-pi'

import {
  handleFatalExceptions,
  getPreviousFatalException,
} from './FatalExceptionManager'
import httpServer from './server/httpServer'
import webRTCServer from './server/webRTCServer'

import packageJSON from '../package.json'

// var exec = require('child_process').exec
// exec("id", function(err, stdout, stderr) {
//   console.log(`ID!!!`, stdout);
// });
// exec("groups", function(err, stdout, stderr) {
//   console.log(`GROUPS!!!!!`, stdout);
// });

const availablePlugins = {
  '@tegapp/autodrop3d': tegAutodrop3D,
  '@tegapp/core': tegCore,
  '@tegapp/driver-serial-gcode': tegDriverSerialGCode,
  '@tegapp/macros-default': tegMacrosDefault,
  '@tegapp/raspberry-pi': tegRaspberryPi,
}

const {
  initializeConfig,
  executableSchema,
  createTegHostStore,
  authenticate,
} = tegCore

// global.Promise = Promise

// Get document, or throw exception on error
const loadConfigForm = async (configPath) => {
  if (!fs.existsSync(configPath)) {
    // const devPath = path.join(__dirname, '../../../development.config')
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const devConfig = require('../development.config')
    if (devConfig.auth.hostIdentityKeys == null) {
      devConfig.auth.hostIdentityKeys = await createECDHKey()
    }
    writeFileAtomic.sync(configPath, JSON.stringify(devConfig, null, 2))
  }
  try {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return JSON.parse(fs.readFileSync(configPath))
  } catch (e) {
    throw new Error(`Unable to load config file ${configPath}\n${e.message}`, e)
  }
}

const tegServer = async (argv, pluginLoader) => {
  // eslint-disable-next-line no-console
  console.error(`Teg v${packageJSON.version}`)

  const expectedUseage = 'Useage: teg serve [CONFIG_DIRECTORY]'

  const [, , cmd, configArg] = argv

  if (cmd === '--help') {
    // eslint-disable-next-line no-console
    console.error(expectedUseage)
    return
  }

  const allCmds = [
    'serve',
  ]

  if (allCmds.includes(cmd) === false) {
    // eslint-disable-next-line no-console
    console.error(`Invalid command: ${cmd}`)
    // eslint-disable-next-line no-console
    console.error(expectedUseage)
    process.exitCode = 1
    return
  }

  const configDir = path.resolve(
    configArg
    || path.join(os.homedir(), '.teg'),
  )

  // const updatesFile = path.join(configDir, '.updates')

  // create the config directory if it doesn't exist
  mkdirp.sync(configDir)

  // touch the updates file
  // fs.closeSync(fs.openSync(updatesFile, 'a'))

  // const writePIDFile = (json) => {
  //   writeFileAtomic.sync(updatesFile, JSON.stringify(json, null, 2))
  // }

  const pidFile = path.join(configDir, 'teg.pid')

  const createPidFile = () => {
    try {
      const pid = npid.create(pidFile)
      pid.removeOnExit()

      return { pidCreated: true }
    } catch (err) {
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

  const configPath = path.join(configDir, 'config.json')
  const config = await loadConfigForm(configPath)

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
