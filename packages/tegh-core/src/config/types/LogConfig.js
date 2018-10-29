import { Record, List } from 'immutable'
import uuid from 'uuid/v4'

import { WARNING, ERROR, FATAL } from '../../log/types/logLevelEnum'

export const LogConfigFactory = Record({
  maxLength: 1000,
  stderr: List([WARNING, ERROR, FATAL]),
})

const LogConfig = props => (
  LogConfigFactory({
    id: props.id || uuid(),
    ...props(),
  })
)

export default LogConfig
