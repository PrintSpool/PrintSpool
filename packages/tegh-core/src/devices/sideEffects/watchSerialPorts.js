import fs from 'fs'
import chokidar from 'chokidar'

import Device from '../types/Device'
import { SERIAL_PORT } from '../types/DeviceTypeEnum'

import deviceConnected from '../actions/deviceConnected'
import deviceDisconnected from '../actions/deviceDisconnected'

const watchSerialPorts = (getState, dispatch) => {
  let watcher

  const createWatcher = () => {
    watcher = chokidar.watch('/dev/serial/by-id/')

    watcher
      .on('add', (path) => {
        if (getState().devices.byID.has(path)) return

        const device = Device({ id: path, type: SERIAL_PORT })
        dispatch(deviceConnected({ device }))
      })
      .on('unlink', (path) => {
        if (getState().devices.has(path) === false) return

        const device = Device({ id: path, type: SERIAL_PORT })
        dispatch(deviceDisconnected({ device }))
      })
  }

  createWatcher()

  fs.watch('/dev/', (eventType, filename) => {
    if (filename === 'serial') {
      watcher.close()
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
}

export default watchSerialPorts
