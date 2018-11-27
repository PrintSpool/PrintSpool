import { Record, Map } from 'immutable'
import uuid from 'uuid/v4'

import { TOOLHEAD } from './ComponentTypeEnum'

export const ToolheadConfigFactory = Record({
  id: null,
  modelVersion: 0,
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
  modelVersion = 0,
  ...props
} = {}) => (
  ToolheadConfigFactory({
    ...props,
    id,
    modelVersion,
    extendedConfig: Map(props.extendedConfig),
  })
)

export default ToolheadConfig
