import { Record, Map } from 'immutable'
import uuid from 'uuid'

export const AxisConfigFactory = Record({
  id: null,
  modelVersion: 0,
  address: null,
  type: null,
  name: null,
  feedrate: null,
  extendedConfig: Map(),
})

const AxisConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  ...props
} = {}) => (
  AxisConfigFactory({
    ...props,
    id,
    modelVersion,
    extendedConfig: Map(props.extendedConfig),
  })
)

export default AxisConfig
