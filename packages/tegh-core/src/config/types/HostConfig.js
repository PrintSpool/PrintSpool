import { Record, List } from 'immutable'
import uuid from 'uuid/v4'

import CrashReportConfig from './CrashReportConfig'
import MaterialConfig from './MaterialConfig'

export const HostConfigRecordFactory = Record({
  id: null,
  crashReports: CrashReportConfig(),
  materials: List(),
})

const HostConfig = ({
  id,
  crashReports = {},
  materials = [],
  ...props
}) => (
  HostConfigRecordFactory({
    id: id || uuid(),
    crashReports: CrashReportConfig(crashReports),
    materials: materials.map(MaterialConfig),
    ...props,
  })
)

export default HostConfig
