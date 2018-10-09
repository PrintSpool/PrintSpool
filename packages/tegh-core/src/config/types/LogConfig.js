import { Record } from 'immutable'
import t from 'tcomb-validation'

import logLevelEnum from '../../log/types/logLevelEnum'

export const LogConfigStruct = t.struct({
  maxLength: t.Integer,
  stderr: t.list(t.enums.of(logLevelEnum.toArray())),
})

const LogConfig = Record({
  maxLength: 1000,
  stderr: ['warning', 'error', 'fatal'],
})

export default LogConfig
