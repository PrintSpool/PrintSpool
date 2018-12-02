import { Record, List, Map } from 'immutable'
import uuid from 'uuid'

import CrashReportConfig from './CrashReportConfig'
import MaterialConfig from './MaterialConfig'
import LogConfig from './LogConfig'

export const HostConfigRecordFactory = Record({
  id: null,
  modelVersion: 0,
  configDirectory: '~/.tegh/',
  name: null,
  crashReports: CrashReportConfig(),
  materials: List(),
  model: Map(),
  log: LogConfig(),
})

const HostConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  crashReports = {},
  materials = [],
  log = {},
  ...props
} = {}) => (
  HostConfigRecordFactory({
    ...props,
    id,
    modelVersion,
    crashReports: CrashReportConfig(crashReports),
    materials: materials.map(MaterialConfig),
    log: LogConfig(log),
    model: Map(props.model),
  })
)

export default HostConfig
