import getPluginModels from './getPluginModels'

const isMacroEnabled = ({ config, meta }) => {
  const models = getPluginModels(config)

  const enabledMacros = models.getIn([meta.package, 'macros'], [])

  const enabled = (
    enabledMacros.includes('*')
    || enabledMacros.includes(meta.macro)
  )

  return enabled
}

export default isMacroEnabled
