import { Record, Map } from 'immutable'
import uuid from 'uuid/v4'

import { BUILD_PLATFORM } from './ComponentTypeEnum'

export const BuildPlatformConfigFactory = Record({
  id: null,
  type: BUILD_PLATFORM,
  name: null,
  heater: false,
  extendedConfig: Map(),
})

const BuildPlatformConfig = props => (
  BuildPlatformConfigFactory({
    ...props,
    id: props.id || uuid(),
    extendedConfig: Map(props.extendedConfig),
  })
)

export default BuildPlatformConfig
