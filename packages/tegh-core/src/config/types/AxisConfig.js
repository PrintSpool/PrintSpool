import { Record } from 'immutable'
import uuid from 'uuid/v4'

export const AxisConfigFactory = Record({
  id: null,
  name: null,
  feedrate: null,
})

const AxisConfig = props => (
  AxisConfigFactory({
    id: props.id || uuid(),
    ...props(),
  })
)

export default AxisConfig
