import { Record, Map } from 'immutable'
import t from 'tcomb-validation'

export const PrintFromLocalPathConfigStruct = t.struct({
  enabled: t.Boolean,
  allowSymlinks: t.Boolean,
  whitelist: t.list(t.String),
})

const PrintFromLocalPathConfig = Record({
  enabled: false,
  allowSymlinks: false,
  whitelist: [
    '~/.tegh-local-files/',
  ],
})
export default PrintFromLocalPathConfig
