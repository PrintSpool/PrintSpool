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
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  const config = default()
  const configFile = path.resolve(configDir, `${config.id}.yml`)
  // TODO create package.json in config directory

  const askFor = async (key, instructions) => {
    const defaultValue = config[key]
    const output = `
      ${instructions}

      ${key} (default: ${JSON.stringify(defaultValue)}):
    `
    // TODO wait for input
    const input = await Promise.promisify(rl.question)(output)
    return input || defaultValue
  }

  const driverNameWithoutSuffix = await askFor('driver', `
    Tegh requires a driver to connect to the printer. Below is a list of
    driver options.

    Supported printers:

    * Lulzbot TAZ ......................... 'serial-gcode'

    Untested but expected to work:

    * Ultimaker 1 ......................... 'serial-gcode'
    * RepRaps w/ Marlin Firwmare .......... 'serial-gcode'
    * Printrbot ........................... 'serial-gcode'
    * Orion Delta ......................... 'serial-gcode'

    Other printers are not supported at present however we encourage you to
    develop your own driver and add support for more 3D printers to Tegh.
  `)
  const driverName = `tegh-driver-${driverNameWithoutSuffix}`

  await fs.mkdirSync(configDir)

  await npm.install([driverName], {
    cwd: configDir,
    save: true,
  })

  /* Driver-specific configuration */

  const driver = require(driverName)
  config.driver = {
    package: driverNameWithoutSuffix,
    ...driver.interactiveCreateConfig()
  }

  rl.close()
  fs.writeFileSync(configFile, yaml.safeDump(config))

  console.log(`
    Congrats! Your almost ready to start printing!

    Your Tegh configuration has been saved to ${configFile}

    Now to start your printer run: tegh start ${configFile}
  `)

}

export default interactiveCreateConfig
