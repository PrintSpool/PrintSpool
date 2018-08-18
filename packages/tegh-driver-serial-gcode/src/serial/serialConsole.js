import { loadConfig } from 'tegh-core'

import createSerialPort from './createSerialPort'

const serialConsole = () => {
  const configPath = './tegh.yml'
  const config = loadConfig(configPath)

  const {
    serialPort,
    serialOptions,
    parser,
    path,
    baudRate,
  } = createSerialPort(config)

  console.log(`opening ${path} with options:`, serialOptions)
  serialPort.open()

  serialPort.on('open', () => {
    console.log('opened')
  })

  parser.on('data', (data) => {
    console.log(`rx: ${data}`)
  })
}

export default serialConsole
