import { Record } from 'immutable'
import uuid from 'uuid/v4'

import { TOOLHEAD } from './ComponentTypeEnum'

export const ToolheadConfigFactory = Record({
  id: null,
  type: TOOLHEAD,
  name: null,
  heater: false,
  feedrate: null,
  materialID: null,
})

const ToolheadConfig = props => (
  ToolheadConfigFactory({
    id: props.id || uuid(),
    ...props,
  })
)

export default ToolheadConfig
