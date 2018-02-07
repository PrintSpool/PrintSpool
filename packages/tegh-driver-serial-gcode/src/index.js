import serialMiddleware from 'serial-middleware'
import SerialPort from 'serialport'
import _ from 'lodash'

// import config from './config.js'
import createSerialPort from './serial/createSerialPort'
import rxParser from './rxParser.js'
import * as selectors from './selectors/'
import * as sagasByName from './sagas/'

export { default as reducer } from './reducer'
export { default as logger } from './logger'
export { default as validate } from './config/validate'
export { default as serialConsole } from './serial/serialConsole'

export const sagas = ({ config }) => {
  return Object.values(sagasByName).map(saga => saga(selectors))
}
// export { config }

export const middleware = ({ config }) => {
  const {
    serialPort,
    parser,
    isConnected,
  } = createSerialPort(config)
  // TODO: monitor file and open serial port when it exists
  // setImmediate(() => serialPort.open())

  return [
    serialMiddleware({
      serialPort,
      parser,
      isConnected,
      receiveParser: rxParser,
    }),
  ]
}
