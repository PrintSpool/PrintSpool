import { Record, Map } from 'immutable'
import uuid from 'uuid/v4'

import { TOOLHEAD } from './ComponentTypeEnum'

export const ToolheadConfigFactory = Record({
  id: null,
  address: null,
  type: TOOLHEAD,
  name: null,
  heater: false,
  feedrate: null,
  materialID: null,
  extendedConfig: Map(),
})

const ToolheadConfig = ({
  id = uuid(),
  ...props
} = {}) => (
  ToolheadConfigFactory({
    ...props,
    id,
    extendedConfig: Map(props.extendedConfig),
  })
)

export default ToolheadConfig
