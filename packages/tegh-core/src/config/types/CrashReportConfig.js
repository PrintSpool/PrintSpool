import { Record, Map } from 'immutable'
import uuid from 'uuid/v4'

export const CrashReportConfigFactory = Record({
  id: null,
  directory: '/var/log/tegh',
  uploadCrashReportsToDevs: true,
  extendedConfig: Map(),
})

const CrashReportConfig = ({
  id = uuid(),
  ...props
} = {}) => (
  CrashReportConfigFactory({
    ...props,
    id,
    extendedConfig: Map(props.extendedConfig),
  })
)

export default CrashReportConfig
