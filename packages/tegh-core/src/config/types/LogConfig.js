import { Record } from 'immutable'
import t from 'tcomb-validation'

import logLevelEnum from '../../log/types/logLevelEnum'

export const LogConfigStruct = t.sruct({
  maxLength: t.Integer,
  stderr: t.list(t.enums(logLevelEnum.toJS())),
})

const LogConfig = Record(
  Map(LogConfigStruct.meta.props).mapValues(() => null),
)

export default LogConfig
