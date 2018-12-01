import { Record, Map } from 'immutable'
import uuid from 'uuid'

export const CrashReportConfigFactory = Record({
  id: null,
  modelVersion: 0,
  directory: '/var/log/tegh',
  uploadCrashReportsToDevs: true,
  extendedConfig: Map(),
})

const CrashReportConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  ...props
} = {}) => (
  CrashReportConfigFactory({
    ...props,
    id,
    modelVersion,
    extendedConfig: Map(props.extendedConfig),
  })
)

export default CrashReportConfig
