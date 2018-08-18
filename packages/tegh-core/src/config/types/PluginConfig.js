import { Record } from 'immutable'
import t from 'tcomb-validation'

export const PluginConfigStruct = t.struct({
  package: t.String,
  settings: t.maybe(t.dict(t.String, t.Any)),
})

const PluginConfig = Record(
  Map(PluginConfigStruct.meta.props).mapValues(() => null),
)

export default PluginConfig
