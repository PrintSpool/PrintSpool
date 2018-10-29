import { Record } from 'immutable'
import uuid from 'uuid/v4'

const MaterialConfigFactory = Record({
  targetTemperature: 0,
  targetBedTemperature: 0,
})

const MaterialConfig = props => (
  MaterialConfigFactory({
    id: props.id || uuid(),
    ...props,
  })
)

export default MaterialConfig
