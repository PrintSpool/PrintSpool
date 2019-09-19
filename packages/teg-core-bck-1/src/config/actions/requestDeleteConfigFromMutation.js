import requestSetConfig from './requestSetConfig'
import getMutationConfigFormInfo from '../selectors/getMutationConfigFormInfo'

const requestDeleteConfigFromMutation = (source, args, { store }) => {
  const state = store.getState()

  const {
    configPath,
    subject,
  } = getMutationConfigFormInfo({ state, args })

  if (
    subject.isEssentialPlugin
  ) {
    throw new Error(
      `Cannot delete plugins that are essential to Teg: ${subject.package}`,
    )
  }

  return requestSetConfig({
    config: state.config.deleteIn(configPath),
  })
}

export default requestDeleteConfigFromMutation
