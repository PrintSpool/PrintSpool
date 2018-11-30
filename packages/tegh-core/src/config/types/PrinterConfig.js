import { Record, List, Map } from 'immutable'
import uuid from 'uuid/v4'

import PluginConfig from './PluginConfig'

import {
  CONTROLLER,
  AXIS,
  TOOLHEAD,
  BUILD_PLATFORM,
  FAN,
} from './components/ComponentTypeEnum'

import BuildPlatformConfig from './components/BuildPlatformConfig'
import AxisConfig from './components/AxisConfig'
import FanConfig from './components/FanConfig'
import SerialControllerConfig from './components/SerialControllerConfig'
import ToolheadConfig from './components/ToolheadConfig'

export const PrinterConfigRecordFactory = Record({
  id: null,
  components: List(),
  plugins: List(),
})

const PrinterConfig = ({
  id = uuid(),
  components = [],
  plugins = [],
} = {}) => (
  PrinterConfigRecordFactory({
    id,
    components: List(components).map((component) => {
      switch (component.type) {
        case CONTROLLER: return SerialControllerConfig(component)
        case AXIS: return AxisConfig(component)
        case TOOLHEAD: return ToolheadConfig(component)
        case BUILD_PLATFORM: return BuildPlatformConfig(component)
        case FAN: return FanConfig(component)
        default: {
          const err = (
            `Invalid component type: ${component.type} for id: ${component.id}`
          )
          throw new Error(err)
        }
      }
    }),

    plugins: List(plugins).map(PluginConfig),
  })
)

export default PrinterConfig
