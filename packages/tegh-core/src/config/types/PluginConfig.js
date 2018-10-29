import { Record, Map, List } from 'immutable'
import uuid from 'uuid/v4'

export const PluginConfigFactory = Record({
  id: null,
  package: null,
  macros: List(),
  settings: Map(),
})

const PluginConfig = ({
  macros = [],
  settings = {},
  ...props
}) => (
  PluginConfigFactory({
    id: props.id || uuid(),
    macros: List(macros),
    settings: Map(settings),
    ...props,
  })
)

export default PluginConfig
