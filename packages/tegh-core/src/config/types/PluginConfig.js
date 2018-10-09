import { Record, Map } from 'immutable'
import t from 'tcomb-validation'

export const PluginConfigStruct = t.struct({
  package: t.String,
  settings: t.maybe(t.dict(t.String, t.Any)),
})

const PluginConfig = Record(
  Map(PluginConfigStruct.meta.props).map(() => null).toJS(),
)

export default PluginConfig
