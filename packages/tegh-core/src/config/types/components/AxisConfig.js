import { Record, Map } from 'immutable'
import uuid from 'uuid/v4'

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
  id = uuid(),
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
