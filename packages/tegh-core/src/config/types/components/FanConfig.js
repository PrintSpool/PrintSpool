import { Record } from 'immutable'
import uuid from 'uuid/v4'

import { FAN } from './ComponentTypeEnum'

export const FanConfigFactory = Record({
  id: null,
  type: FAN,
})

const FanConfig = props => (
  FanConfigFactory({
    id: props.id || uuid(),
    ...props,
  })
)

export default FanConfig
