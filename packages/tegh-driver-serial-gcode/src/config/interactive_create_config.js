import 'bluebird'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import npm from 'npm-programmatic'
import homedir from 'homedir'
import yaml from 'js-yaml'
import defaults from './defaults'

const configDir = path.resolve(homedir(), 'tegh')

const interactiveCreateConfig = async () => {
  const config = defaults()

  config.serialPort.path = Promise.promisify(question(`
    Serial port path (default: ${config.serialPort.path}):
  `)) || config.serialPort.path

  config.serialPort.baudRate = Promise.promisify(question(`
    Serial port baud rate (default: ${config.serialPort.baudRate}):
  `)) || config.serialPort.baudRate

  return config
}

export default interactiveCreateConfig
