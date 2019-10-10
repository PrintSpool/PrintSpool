import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import writeFileAtomic from 'write-file-atomic'
import toml from '@iarna/toml'
import Promise from 'bluebird'

import Config from '../types/Config'

const loadConfigOrSetDefault = async ({
  configDirectory,
  defaultConfig,
  createECDHKey,
}) => {
  const { printer: defaultPrinter, ...defaultCombinator } = defaultConfig

  // create the config directory
  if (!fs.existsSync(configDirectory)) {
    await Promise.promisify(mkdirp)(configDirectory, {
      mode: 0o700,
    })
  }

  // load each config file or initialize it with a default value
  const [printer, combinator] = await Promise.all([
    ['machine.toml', defaultPrinter],
    ['combinator.toml', defaultCombinator],
  ].map(async ([filename, data]) => {
    const configFile = path.join(configDirectory, filename)

    if (fs.existsSync(configFile)) {
      try {
        return toml.parse(fs.readFileSync(configFile))
      } catch (e) {
        throw new Error(`Unable to load config file ${configFile}\n${e.message}`, e)
      }
    } else {
      let dataToWrite = data
      if (data === defaultCombinator) {
        /* eslint-disable no-param-reassign */
        delete data.host.id
        delete data.host.localID
        data.auth.hostIdentityKeys = await createECDHKey()
        dataToWrite = Config(data)
          .set('printer', null)
          .toJS()
      }

      const fileContent = toml.stringify(dataToWrite)

      await Promise.promisify(writeFileAtomic)(configFile, fileContent)

      return data
    }
  }))

  return {
    printer,
    ...combinator,
  }
}

export default loadConfigOrSetDefault
