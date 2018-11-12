import { Record, Map } from 'immutable'
import uuid from 'uuid/v4'

import { FAN } from './ComponentTypeEnum'

export const FanConfigFactory = Record({
  id: null,
  address: null,
  type: FAN,
  extendedConfig: Map(),
})

const FanConfig = ({
  id = uuid(),
  ...props
} = {}) => (
  FanConfigFactory({
    ...props,
    id,
    extendedConfig: Map(props.extendedConfig),
  })
)

export default FanConfig
