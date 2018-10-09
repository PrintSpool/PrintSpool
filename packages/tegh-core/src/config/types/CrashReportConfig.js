import { Record, Map } from 'immutable'
import t from 'tcomb-validation'

export const CrashReportConfigStruct = t.struct({
  directory: t.String,
  uploadCrashReportsToDevs: t.Boolean,
})

const CrashReportConfig = Record({
  directory: '/var/log/tegh',
  uploadCrashReportsToDevs: true,
})

export default CrashReportConfig
