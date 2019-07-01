import { Record, List, Map } from 'immutable'
import uuid from 'uuid'

import { WARNING, ERROR, FATAL } from '../../log/types/logLevelEnum'

export const LogConfigFactory = Record({
  id: null,
  modelVersion: 0,
  maxLength: 1000,
  stderr: List([WARNING, ERROR, FATAL]),
  model: Map(),
})

const LogConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  model = {},
  ...props
} = {}) => (
  LogConfigFactory({
    ...props,
    id,
    modelVersion,
    model: Map(model),
  })
)

export default LogConfig
