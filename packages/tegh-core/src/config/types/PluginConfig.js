import { Record, Map, List } from 'immutable'
import uuid from 'uuid'

export const PluginConfigFactory = Record({
  id: null,
  modelVersion: 0,
  package: null,
  macros: List(),
  extendedConfig: Map(),
  name: null,
})

const PluginConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  macros = [],
  settings = {},
  ...props
} = {}) => (
  PluginConfigFactory({
    ...props,
    id,
    modelVersion,
    macros: List(macros),
    settings: Map(settings),
    extendedConfig: Map(props.extendedConfig),
  })
)

export default PluginConfig
