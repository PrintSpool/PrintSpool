import { Record } from 'immutable'
import uuid from 'uuid/v4'

const MaterialConfigFactory = Record({
  id: null,
  modelVersion: 0,
  type: null,
  targetExtruderTemperature: 0,
  targetBedTemperature: 0,
})

const MaterialConfig = ({
  id = uuid(),
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
