import { Record } from 'immutable'
import t from 'tcomb-validation'

export const CrashReportConfigStruct = t.struct({
  directory: t.String,
  uploadCrashReportsToDevs: t.Boolean,
})

const CrashReportConfig = Record(
  Map(CrashReportConfigStruct.meta.props).mapValues(() => null),
)

export default CrashReportConfig
