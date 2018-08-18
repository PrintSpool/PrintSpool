import { Record, Map } from 'immutable'
import t from 'tcomb-validation'

import logLevelEnum from '../../log/types/logLevelEnum'

export const LogConfigStruct = t.struct({
  maxLength: t.Integer,
  stderr: t.list(t.enums.of(logLevelEnum.toArray())),
})

const LogConfig = Record(
  Map(LogConfigStruct.meta.props).map(() => null),
)

export default LogConfig
