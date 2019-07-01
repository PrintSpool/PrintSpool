import { Record, Map } from 'immutable'
import uuid from 'uuid'

export const CrashReportConfigFactory = Record({
  id: null,
  modelVersion: 0,
  directory: '/var/log/teg',
  uploadCrashReportsToDevs: true,
  model: Map(),
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
    model: Map(props.model),
  })
)

export default CrashReportConfig
