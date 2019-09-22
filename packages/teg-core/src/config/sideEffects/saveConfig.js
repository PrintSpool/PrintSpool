import path from 'path'
import Promise from 'bluebird'
import mkdirp from 'mkdirp'
import writeFileAtomic from 'write-file-atomic'
import toml from '@iarna/toml'

import getConfigDirectory from '../selectors/getConfigDirectory'

const saveConfig = async ({
  config,
  onComplete,
}) => {
  const configDirectory = getConfigDirectory(config)

  const machine = config.printer
  const combinator = config.set('printer', null)

  await Promise.all([
    ['combinator.toml', combinator],
    ['machine.toml', machine],
  ].map(async ([filename, data]) => {
    const configFile = path.join(configDirectory, filename)
    const fileContent = toml.stringify(data.toJS())
  
    await Promise.promisify(mkdirp)(configDirectory, {
      mode: 0o700,
    })
    await Promise.promisify(writeFileAtomic)(configFile, fileContent)
  }))

  if (onComplete != null) onComplete(config)
}

export default saveConfig
