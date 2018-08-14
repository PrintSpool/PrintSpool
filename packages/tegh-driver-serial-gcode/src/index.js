import serialMiddleware from 'serial-middleware'
import SerialPort from 'serialport'
import _ from 'lodash'

// import config from './config.js'
import createSerialPort from './serial/createSerialPort'
import rxParser from './rxParser'

export logger from './log/reducers/logReducer'

// export validate from './config/validate'
export serialConsole from './serial/serialConsole'

// TODO: refactor to dynamic config
export const middleware = [
  serialMiddleware,
]
