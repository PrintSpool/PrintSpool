import { Record, Map } from 'immutable'
import uuid from 'uuid'
import ComponentTypeEnum from './ComponentTypeEnum'


export const ComponentConfigFactory = Record({
  id: null,
  modelVersion: 0,
  type: null,
  model: Map(),
})

const ComponentConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  type,
  model,
} = {}) => {
  if (ComponentTypeEnum.includes(type) === false) {
    throw new Error(`Invalid component type: ${type}`)
  }
  return ComponentConfigFactory({
    id,
    modelVersion,
    type,
    model: Map(model),
  })
}

export default ComponentConfig
