import { Record, List, Map } from 'immutable'
import uuid from 'uuid/v4'

import { WARNING, ERROR, FATAL } from '../../log/types/logLevelEnum'

export const LogConfigFactory = Record({
  maxLength: 1000,
  stderr: List([WARNING, ERROR, FATAL]),
  extendedConfig: Map(),
})

const LogConfig = ({
  id = uuid(),
  ...props
} = {}) => (
  LogConfigFactory({
    ...props,
    id,
    extendedConfig: Map(props.extendedConfig),
  })
)

export default LogConfig
