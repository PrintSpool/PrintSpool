import serialMiddleware from 'serial-middleware'
import SerialPort from 'serialport'
import _ from 'lodash'

// import config from './config.js'
import createSerialPort from './serial/create_serial_port'
import rxParser from './rx_parser.js'
import * as selectors from './selectors/'
import * as sagasByName from './sagas/'

export { default as reducer } from './reducer'
export { default as logger } from './logger'
export { default as validate } from './config/validate'
export { default as serialConsole } from './serial/serial_console'

export const sagas = ({ config }) => {
  Object.values(sagasByName).map(saga => saga(selectors))
}
// export { config }

export const middleware = ({ config }) => {
  const {
    serialPort,
    parser,
  } = createSerialPort(config)

  return [
    serialMiddleware({ serialPort, parser, receiveParser: rxParser }),
  ]
}
