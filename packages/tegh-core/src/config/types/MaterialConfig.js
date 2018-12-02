import { Record, Map } from 'immutable'
import uuid from 'uuid'

const MaterialConfigFactory = Record({
  id: null,
  modelVersion: 0,
  type: null,
  model: null,
})

const MaterialConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  type,
  model,
} = {}) => (
  MaterialConfigFactory({
    id,
    modelVersion,
    type,
    model: Map(model),
  })
)

export default MaterialConfig
