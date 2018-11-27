import { Record, List, Map } from 'immutable'
import uuid from 'uuid/v4'

import CrashReportConfig from './CrashReportConfig'
import MaterialConfig from './MaterialConfig'
import LogConfig from './LogConfig'

export const HostConfigRecordFactory = Record({
  id: null,
  modelVersion: 0,
  name: null,
  crashReports: CrashReportConfig(),
  materials: List(),
  extendedConfig: Map(),
  log: LogConfig(),
})

const HostConfig = ({
  id = uuid(),
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
    extendedConfig: Map(props.extendedConfig),
  })
)

export default HostConfig
