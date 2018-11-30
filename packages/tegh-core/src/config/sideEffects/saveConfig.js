import fs from 'fs'
import path from 'path'
import Promise from 'bluebird'
import mkdirp from 'mkdirp'

import getConfigDirectory from '../selectors/getConfigDirectory'

const saveConfig = async ({ config }) => {
  const configDirectory = getConfigDirectory(config)
  const configFile = path.join(configDirectory, 'config.json')

  const fileContent = JSON.stringify(config.toJSON(), null, 2)

  await Promise.promisify(mkdirp)(configDirectory, {
    mode: 0o700,
  })
  await Promise.promisify(fs.writeFile)(configFile, fileContent)
}

export default saveConfig
