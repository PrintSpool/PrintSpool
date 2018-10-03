import { Record, Map } from 'immutable'
import t from 'tcomb-validation'

import { ConfigFormStruct, configFormStructFields } from './ConfigForm'

export const ConfigStruct = t.struct({
  isInitialized: t.Boolean,
  pluginManager: t.Any,
  /*
   * The configForm is a map of all the user-visible configuration
   * exactly as it was entered by the user.
   *
   * The configForm is not validated directly because it can be incomplete - if
   * the user wishes to use a default value that entry will be null in the
   * configForm.
   */
  configForm: t.dict(t.String, t.Any),
  /* HTTP Port / Unix Socket configuration */
  server: t.struct({
    tcpPort: t.maybe(t.Number),
    unixSocket: t.maybe(t.String),
  }),

  // copy all rules from the configForm to the config
  ...configFormStructFields,
})

export const validateCoreConfig = (config) => {
  const validation = t.validate(ConfigStruct, config)

  if (!validation.isValid()) {
    throw new Error(validation.firstError().message)
  }
}

const defaultValues = Map(ConfigStruct.meta.props)
  .map(() => null)
  .set('isInitialized', false)
  .set('plugins', Map())

const Config = Record(defaultValues)

export default Config
