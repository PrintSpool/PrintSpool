import { Record, List, Map } from 'immutable'
import uuid from 'uuid/v4'

import CrashReportConfig from './CrashReportConfig'
import MaterialConfig from './MaterialConfig'

export const HostConfigRecordFactory = Record({
  id: null,
  crashReports: CrashReportConfig(),
  materials: List(),
  extendedConfig: Map(),
})

const HostConfig = ({
  id,
  crashReports = {},
  materials = [],
  ...props
}) => (
  HostConfigRecordFactory({
    ...props,
    id: id || uuid(),
    crashReports: CrashReportConfig(crashReports),
    materials: materials.map(MaterialConfig),
    extendedConfig: Map(props.extendedConfig),
  })
)

export default HostConfig
