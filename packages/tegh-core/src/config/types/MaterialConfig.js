import { Record } from 'immutable'
import uuid from 'uuid/v4'

const MaterialConfigFactory = Record({
  targetTemperature: 0,
  targetBedTemperature: 0,
})

const MaterialConfig = ({
  id = uuid(),
  ...props
} = {}) => (
  MaterialConfigFactory({
    ...props,
    id,
  })
)

export default MaterialConfig
