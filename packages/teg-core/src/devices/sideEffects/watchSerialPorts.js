import fs from 'fs'
import chokidar from 'chokidar'

import Device from '../types/Device'
import { SERIAL_PORT } from '../types/DeviceTypeEnum'

import deviceConnected from '../actions/deviceConnected'
import deviceDisconnected from '../actions/deviceDisconnected'

const watchSerialPorts = (getState, dispatch) => {
  let byIDWatcher

  const addWatcherListeners = (watcher) => {
    watcher
      .on('add', (path) => {
        if (getState().devices.byID.has(path)) return

        const device = Device({
          id: path,
          type: SERIAL_PORT,
          connected: true,
        })
        dispatch(deviceConnected({ device }))
      })
      .on('unlink', (path) => {
        if (getState().devices.byID.has(path) === false) return

        const device = Device({
          id: path,
          type: SERIAL_PORT,
          connected: true,
        })
        dispatch(deviceDisconnected({ device }))
      })
  }

  const createWatcher = () => {
    byIDWatcher = chokidar.watch('/dev/serial/by-id/')

    addWatcherListeners(byIDWatcher)
  }

  createWatcher()

  fs.watch('/dev/', (eventType, filename) => {
    if (filename === 'serial') {
      byIDWatcher.close()
      getState().devices.byID
        .filter(device => device.type === SERIAL_PORT)
        .forEach(device => dispatch(deviceDisconnected({ device })))
      /*
       * recreate the watcher after any change to it's parent /dev/serial
       * folder. This prevents the watcher from watching a deleted unode when
       * it should be watching a new unode that was created as a replacement.
       */
      createWatcher()
    }
  })

  // klipper serial port is created in /tmp/printer so it needs a seperate
  // watcher.
  // If you are configuring multiple klipper printer (is that even possible?)
  // you MUST prefix each printer's path with /tmp/printer eg. /tmp/printer3
  const klipperWatcher = chokidar.watch('/tmp/printer*')
  addWatcherListeners(klipperWatcher)
}

export default watchSerialPorts
