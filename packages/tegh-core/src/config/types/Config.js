import { Record, List } from 'immutable'
import uuid from 'uuid'

import HostConfig from './HostConfig'
import PrinterConfig from './PrinterConfig'
import MaterialConfig from './MaterialConfig'

export const ConfigRecordFactory = Record({
  id: null,
  modelVersion: 0,
  host: null,
  printer: null,
  materials: List(),
})

const Config = ({
  id = uuid.v4(),
  modelVersion = 0,
  host = {},
  printer = {},
  materials = [],
  ...props
} = {}) => (
  ConfigRecordFactory({
    id,
    modelVersion,
    host: HostConfig(host),
    printer: PrinterConfig(printer),
    materials: List(materials).map(material => MaterialConfig(material)),
    ...props,
  })
)

export const MockConfig = ({
  host = {},
  printer = {},
  ...props
} = {}) => {
  // eslint-disable-next-line global-require
  const developmentConfig = require('../../../../../development.config')
  return Config({
    ...developmentConfig,
    host: {
      ...developmentConfig.host,
      ...host,
    },
    printer: {
      ...developmentConfig.printer,
      ...printer,
    },
    ...props,
  })
}

export default Config
