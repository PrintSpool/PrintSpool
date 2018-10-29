import { Record, List } from 'immutable'
import uuid from 'uuid/v4'

import AxisConfig from './AxisConfig'
import PluginConfig from './PluginConfig'
import LogConfig from './LogConfig'

import {
  CONTROLLER,
  TOOLHEAD,
  BUILD_PLATFORM,
  FAN,
} from './components/ComponentTypeEnum'

import BuildPlatformConfig from './components/BuildPlatformConfig'
import FanConfig from './components/FanConfig'
import SerialControllerConfig from './components/SerialControllerConfig'
import ToolheadConfig from './components/ToolheadConfig'

export const PrinterConfigRecordFactory = Record({
  id: null,
  printerID: null,
  modelID: null,

  name: null,
  axes: List(),
  components: List(),

  plugins: List(),
  log: LogConfig(),
})

const PrinterConfig = ({
  id,

  axes = [],
  components = [],

  plugins = [],
  log = {},

  ...props
}) => (
  PrinterConfigRecordFactory({
    id: id || uuid(),

    axes: axes.map(AxisConfig),
    components: components.map((component) => {
      switch (component.type) {
        case CONTROLLER: return SerialControllerConfig(component)
        case TOOLHEAD: return ToolheadConfig(component)
        case BUILD_PLATFORM: return BuildPlatformConfig(component)
        case FAN: return FanConfig(component)
        default: {
          throw new Error(`Invalid component type: ${component.type}`)
        }
      }
    }),

    plugins: plugins.map(PluginConfig),
    log: LogConfig(log),

    ...props,
  })
)

export default PrinterConfig
