import { Record, Map } from 'immutable'
import uuid from 'uuid'

export const PluginConfigFactory = Record({
  id: null,
  modelVersion: 0,
  package: null,
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
    model: Map(props.model),
  })
)

export default PluginConfig
