import requestSetConfig from './requestSetConfig'
import getMutationConfigFormInfo from '../selectors/getMutationConfigFormInfo'

const requestDeleteConfigFromMutation = (source, args, { store }) => {
  const {
    configFormID,
  } = args.input
  const state = store.getState()
  const {
    subject,
    collectionPath,
  } = getMutationConfigFormInfo({ state, args })

  if (subject === null) {
    return
  }

  const index = state.config.getIn(collectionPath).findIndex(c => (
    c.id === configFormID
  ))

  const nextConfig = state.config.deleteIn([...collectionPath, index])

  const action = requestSetConfig({
    config: nextConfig,
  })

  return action
}

export default requestDeleteConfigFromMutation
