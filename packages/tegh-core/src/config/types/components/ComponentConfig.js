import { Record, Map } from 'immutable'
import uuid from 'uuid'

export const ComponentConfigFactory = Record({
  id: null,
  modelVersion: 0,
  type: null,
  model: Map(),
})

const ComponentConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  ...props
} = {}) => (
  ComponentConfigFactory({
    ...props,
    id,
    modelVersion,
    model: Map(props.model),
  })
)

export default ComponentConfig
