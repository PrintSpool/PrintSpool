import { Record, Map } from 'immutable'
import uuid from 'uuid/v4'

export const CrashReportConfigFactory = Record({
  id: null,
  directory: '/var/log/tegh',
  uploadCrashReportsToDevs: true,
  extendedConfig: Map(),
})

const CrashReportConfig = props => (
  CrashReportConfigFactory({
    ...props(),
    id: props.id || uuid(),
    extendedConfig: Map(props.extendedConfig),
  })
)

export default CrashReportConfig
