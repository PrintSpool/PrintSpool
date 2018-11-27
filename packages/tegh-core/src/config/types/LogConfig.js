import { Record, List, Map } from 'immutable'
import uuid from 'uuid/v4'

import { WARNING, ERROR, FATAL } from '../../log/types/logLevelEnum'

export const LogConfigFactory = Record({
  id: null,
  modelVersion: 0,
  maxLength: 1000,
  stderr: List([WARNING, ERROR, FATAL]),
  extendedConfig: Map(),
})

const LogConfig = ({
  id = uuid(),
  modelVersion = 0,
  extendedConfig = {},
  ...props
} = {}) => (
  LogConfigFactory({
    ...props,
    id,
    modelVersion,
    extendedConfig: Map(extendedConfig),
  })
)

export default LogConfig
