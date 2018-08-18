import { Record } from 'immutable'
import t from 'tcomb-validation'

import { ConfigFormStruct } from './ConfigForm'

export const ConfigStruct = t.struct({
  isInitialized: t.Boolean,
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
    tcpPort: t.optional(t.Number),
    unixSocket: t.optional(t.String),
  }),
  // TODO: somehow copy all rules from the configForm to the config
  ...ConfigFormStruct,
})

export const validateConfig = (config) => {
  const validation = t.validate(ConfigStruct, config)

  if (!validation.isValid()) {
    throw new Error(validation.firstError().message)
  }
}

const defaultValues = Map(ConfigStruct.meta.props)
  .mapValues(() => null)
  .set('isInitialized', false)

const Config = Record(defaultValues)

export default Config
