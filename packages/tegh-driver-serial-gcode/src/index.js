import { all } from 'redux-saga/effects'
import serialMiddleware from 'tegh-serial-middleware'
import SerialPort from 'serialport'
import _ from 'lodash'

// import config from './config.js'
import reducer from './reducer.js'
import rxSaga from './rx_saga.js'
import txSaga from './tx_saga.js'
import rxParser from './rx_parser.js'

// export { config }
export { reducer }

export const saga = (config) => function*() {
  yield all([
    rxSaga,
    txSaga,
  ])
}

export const middleware = (config) => {
  const { path } = config.driver.serialPort
  const serialOpts = _.without(config.driver.serialPort, ['path'])
  const serialPort = new SerialPort(path, serialOpts)
    .pipe(SerialPort.parsers.ReadLine())
    .pipe(rxParser())

  return [
    serialMiddleware(serialPort),
    txMiddleware
  ]
}
