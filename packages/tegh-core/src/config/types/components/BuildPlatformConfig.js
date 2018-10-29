import { Record } from 'immutable'
import uuid from 'uuid/v4'

import { BUILD_PLATFORM } from './ComponentTypeEnum'

export const BuildPlatformConfigFactory = Record({
  id: null,
  type: BUILD_PLATFORM,
  name: null,
  heater: false,
})

const BuildPlatformConfig = props => (
  BuildPlatformConfigFactory({
    id: props.id || uuid(),
    ...props,
  })
)

export default BuildPlatformConfig
