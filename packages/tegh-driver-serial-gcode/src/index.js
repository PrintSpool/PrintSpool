import serialMiddleware from 'serial-middleware'
import SerialPort from 'serialport'
import _ from 'lodash'

// import config from './config.js'
import createSerialPort from './serial/create_serial_port'
import rxParser from './rx_parser.js'

export { default as reducer } from './reducer'
export { default as sagas } from './sagas/'
export { default as serialConsole } from './serial/serial_console'

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
