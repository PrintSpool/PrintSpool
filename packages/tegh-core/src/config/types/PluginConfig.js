import { Record, Map, List } from 'immutable'
import uuid from 'uuid/v4'

export const PluginConfigFactory = Record({
  id: null,
  modelVersion: 0,
  package: null,
  macros: List(),
  extendedConfig: Map(),
})

const PluginConfig = ({
  id = uuid(),
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
