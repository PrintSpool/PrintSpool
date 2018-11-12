import { Record, Map } from 'immutable'
import uuid from 'uuid/v4'

export const AxisConfigFactory = Record({
  id: null,
  address: null,
  name: null,
  feedrate: null,
  extendedConfig: Map(),
})

const AxisConfig = ({
  id = uuid(),
  ...props
} = {}) => (
  AxisConfigFactory({
    ...props,
    id,
    extendedConfig: Map(props.extendedConfig),
  })
)

export default AxisConfig
