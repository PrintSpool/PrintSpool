import { Record, Map } from 'immutable'
import uuid from 'uuid'

const ESSENTIAL_PLUGINS = [
  '@tegapp/core',
  '@tegapp/marlin',
  '@tegapp/macros-default',
]

export const PluginConfigFactory = Record({
  id: null,
  modelVersion: 0,
  package: null,
  isEssential: null,
  model: Map(),
})

const PluginConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  ...props
} = {}) => (
  PluginConfigFactory({
    ...props,
    id,
    modelVersion,
    isEssential: ESSENTIAL_PLUGINS.includes(props.package),
    model: Map(props.model),
  })
)

export default PluginConfig
