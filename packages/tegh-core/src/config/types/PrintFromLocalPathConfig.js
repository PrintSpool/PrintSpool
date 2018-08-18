import { Record } from 'immutable'
import t from 'tcomb-validation'

export const PrintFromLocalPathConfigStruct = t.struct({
  enabled: t.Boolean,
  allowSymlinks: t.Boolean,
  whitelist: t.list(t.String),
})

const PrintFromLocalPathConfig = Record(
  Map(PrintFromLocalPathConfigStruct.meta.props).mapValues(() => null),
)

export default PrintFromLocalPathConfig
