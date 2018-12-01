import { Record } from 'immutable'
import uuid from 'uuid'

const MaterialConfigFactory = Record({
  id: null,
  modelVersion: 0,
  type: null,
  targetExtruderTemperature: 0,
  targetBedTemperature: 0,
})

const MaterialConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  ...props
} = {}) => (
  MaterialConfigFactory({
    ...props,
    id,
    modelVersion,
  })
)

export default MaterialConfig
