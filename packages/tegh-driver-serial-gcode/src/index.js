import serialMiddleware from 'tegh-daemon/driver/serial_middleware'
import SerialPort from 'serialport'
import _ from 'lodash'

// import config from './config.js'
import reducer from './reducer.js'
import rxMiddleware from './rx_middleware.js'
import txMiddleware from './tx_middleware.js'

// export config
export reducer
export const middleware = (config) => {
  const serialPort = new SerialPort(
    config.serialPort.path,
    _.without(config.serialPort, ['path'])
  )
  return [
    serialMiddleware(serialPort),
    rxMiddleware,
    txMiddleware
  ]
}
