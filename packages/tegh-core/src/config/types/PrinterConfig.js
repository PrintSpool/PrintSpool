import { Record, List } from 'immutable'
import uuid from 'uuid'

import PluginConfig from './PluginConfig'
import ComponentConfig from './components/ComponentConfig'

export const PrinterConfigRecordFactory = Record({
  id: null,
  components: List(),
  plugins: List(),
})

const PrinterConfig = ({
  id = uuid.v4(),
  components = [],
  plugins = [],
} = {}) => (
  PrinterConfigRecordFactory({
    id,
    components: List(components).map(ComponentConfig),
    plugins: List(plugins).map(PluginConfig),
  })
)

export default PrinterConfig
