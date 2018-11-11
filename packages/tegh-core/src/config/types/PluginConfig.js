import { Record, Map, List } from 'immutable'
import uuid from 'uuid/v4'

export const PluginConfigFactory = Record({
  id: null,
  package: null,
  macros: List(),
  extendedConfig: Map(),
})

const PluginConfig = ({
  macros = [],
  settings = {},
  ...props
}) => (
  PluginConfigFactory({
    ...props,
    id: props.id || uuid(),
    macros: List(macros),
    settings: Map(settings),
    extendedConfig: Map(props.extendedConfig),
  })
)

export default PluginConfig
