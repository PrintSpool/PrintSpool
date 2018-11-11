import { Record, Map } from 'immutable'
import uuid from 'uuid/v4'

import { FAN } from './ComponentTypeEnum'

export const FanConfigFactory = Record({
  id: null,
  type: FAN,
  extendedConfig: Map(),
})

const FanConfig = props => (
  FanConfigFactory({
    ...props,
    id: props.id || uuid(),
    extendedConfig: Map(props.extendedConfig),
  })
)

export default FanConfig
