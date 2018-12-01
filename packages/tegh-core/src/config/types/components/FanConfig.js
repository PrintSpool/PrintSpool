import { Record, Map } from 'immutable'
import uuid from 'uuid'

import { FAN } from './ComponentTypeEnum'

export const FanConfigFactory = Record({
  id: null,
  modelVersion: 0,
  address: null,
  name: null,
  type: FAN,
  extendedConfig: Map(),
})

const FanConfig = ({
  id = uuid.v4(),
  modelVersion = 0,
  ...props
} = {}) => (
  FanConfigFactory({
    ...props,
    id,
    modelVersion,
    extendedConfig: Map(props.extendedConfig),
  })
)

export default FanConfig
