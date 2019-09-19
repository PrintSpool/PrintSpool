import { Record, List } from 'immutable'
import uuid from 'uuid'

import PluginConfig from './PluginConfig'
import ComponentConfig from './components/ComponentConfig'

export const PrinterConfigRecordFactory = Record({
  id: null,
  modelVersion: null,
  isConfigured: false,
  components: List(),
  plugins: List(),
})

const PrinterConfig = ({
  id = uuid.v4(),
  modelVersion = 1,
  isConfigured,
  components = [],
  plugins = [],
} = {}) => (
  PrinterConfigRecordFactory({
    id,
    modelVersion,
    isConfigured,
    components: List(components).map(ComponentConfig),
    plugins: List(plugins).map(PluginConfig),
  })
)

export default PrinterConfig
