import { Record } from 'immutable'
import uuid from 'uuid/v4'

export const CrashReportConfigFactory = Record({
  id: null,
  directory: '/var/log/tegh',
  uploadCrashReportsToDevs: true,
})

const CrashReportConfig = props => (
  CrashReportConfigFactory({
    id: props.id || uuid(),
    ...props(),
  })
)

export default CrashReportConfig
